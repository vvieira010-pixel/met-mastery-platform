import { Message } from '../entities/message.entity';
import { MessageId } from '../value-objects/message-id.vo';

export interface IMessageRepository {
  save(message: Message): Promise<void>;
  findById(id: MessageId): Promise<Message | null>;
  findByStudentId(studentId: string): Promise<Message[]>;
  findUnreadByStudentId(studentId: string): Promise<Message[]>;
  findByRole(role: string): Promise<Message[]>;
  findByPriority(priority: string): Promise<Message[]>;
  delete(id: MessageId): Promise<void>;
}