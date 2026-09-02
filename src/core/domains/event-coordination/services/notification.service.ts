import { Message } from '../entities/message.entity';
import { IMessageRepository } from '../repositories/message.repository';

export class NotificationService {
  constructor(
    private messageRepository: IMessageRepository
  ) {}

  async sendMessage(message: Message): Promise<Message> {
    await this.messageRepository.save(message);
    return message;
  }

  async sendTeacherToStudent(
    teacherId: string,
    teacherName: string,
    studentId: string,
    subject: string,
    body: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Message> {
    const message = Message.create(
      'teacher',
      teacherName,
      'student',
      studentId,
      subject,
      body,
      priority
    );
    return this.sendMessage(message);
  }

  async sendSystemNotification(
    studentId: string,
    subject: string,
    body: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Message> {
    const message = Message.create(
      'system',
      'System',
      'student',
      studentId,
      subject,
      body,
      priority,
      ['system']
    );
    return this.sendMessage(message);
  }

  async getInbox(studentId: string, unreadOnly: boolean = false): Promise<Message[]> {
    const messages = await this.messageRepository.findByStudentId(studentId);
    if (unreadOnly) {
      return messages.filter(m => !m.read);
    }
    return messages;
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = await this.messageRepository.findById({ value: messageId } as any);
    if (message) {
      message.markAsRead();
      await this.messageRepository.save(message);
    }
  }

  async getUnreadCount(studentId: string): Promise<number> {
    const messages = await this.messageRepository.findByStudentId(studentId);
    return messages.filter(m => !m.read).length;
  }
}