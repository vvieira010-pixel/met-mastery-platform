import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { MessageId } from '../value-objects/message-id.vo';

interface MessageProps {
  id: MessageId;
  fromRole: 'teacher' | 'student' | 'system' | 'parent';
  fromName: string;
  fromId: string;
  toRole: 'teacher' | 'student' | 'parent';
  toId: string;
  subject: string;
  body: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  readAt: Date | null;
}

export class Message extends AggregateRoot<MessageId> {
  private props: MessageProps;

  private constructor(props: MessageProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    fromRole: 'teacher' | 'student' | 'system' | 'parent',
    fromName: string,
    fromId: string,
    toRole: 'teacher' | 'student' | 'parent',
    toId: string,
    subject: string,
    body: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Message {
    return new Message({
      id: MessageId.create(),
      fromRole,
      fromName,
      fromId,
      toRole,
      toId,
      subject,
      body,
      read: false,
      priority,
      createdAt: new Date(),
      readAt: null
    });
  }

  static reconstitute(props: MessageProps): Message {
    return new Message(props);
  }

  markAsRead(): void {
    this.props.read = true;
    this.props.readAt = new Date();
  }

  markAsUnread(): void {
    this.props.read = false;
    this.props.readAt = null;
  }

  get fromRole(): 'teacher' | 'student' | 'system' | 'parent' { return this.props.fromRole; }
  get fromName(): string { return this.props.fromName; }
  get fromId(): string { return this.props.fromId; }
  get toRole(): 'teacher' | 'student' | 'parent' { return this.props.toRole; }
  get toId(): string { return this.props.toId; }
  get subject(): string { return this.props.subject; }
  get body(): string { return this.props.body; }
  get read(): boolean { return this.props.read; }
  get priority(): 'low' | 'normal' | 'high' | 'urgent' { return this.props.priority; }
  get createdAt(): Date { return this.props.createdAt; }
  get readAt(): Date | null { return this.props.readAt; }
}