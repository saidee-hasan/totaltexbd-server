import { ContactMessage, IContactMessage } from '../models/ContactMessage.js';

interface CreateContactInput {
  name?: string;
  fullName?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
}

export class ContactService {
  static async create(data: CreateContactInput): Promise<IContactMessage> {
    const name = (data.name || data.fullName || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const message = (data.message || '').trim();

    if (!name) throw { status: 400, message: 'Name is required.' };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw { status: 400, message: 'A valid email address is required.' };
    }
    if (!message || message.length < 5) {
      throw { status: 400, message: 'Please include a message.' };
    }

    const doc = new ContactMessage({
      name,
      email,
      company: (data.company || '').trim(),
      phone: (data.phone || '').trim(),
      message,
      status: 'new',
    });

    await doc.save();
    return doc.toJSON() as unknown as IContactMessage;
  }

  static async list(query: { status?: string; search?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search && query.search.trim()) {
      const rx = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { message: rx }];
    }

    const items = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(500);
    const total = await ContactMessage.countDocuments(filter);
    // Global counts (independent of the active filter) so KPI cards stay stable.
    const totalAll = await ContactMessage.countDocuments();
    const unread = await ContactMessage.countDocuments({ status: 'new' });

    return {
      items: items.map((d) => d.toJSON()),
      total,
      totalAll,
      unread,
      read: Math.max(0, totalAll - unread),
    };
  }

  static async markRead(id: string): Promise<IContactMessage> {
    const doc = await ContactMessage.findById(id);
    if (!doc) throw { status: 404, message: 'Message not found.' };
    doc.status = 'read';
    await doc.save();
    return doc.toJSON() as unknown as IContactMessage;
  }

  static async remove(id: string): Promise<void> {
    const doc = await ContactMessage.findById(id);
    if (!doc) throw { status: 404, message: 'Message not found.' };
    await ContactMessage.findByIdAndDelete(id);
  }
}
