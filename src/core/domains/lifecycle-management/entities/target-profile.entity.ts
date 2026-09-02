import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { TargetProfileId } from '../value-objects/target-profile-id.vo';

type TargetProfileType = 'endorsement' | 'visascreen' | 'healthcare' | 'custom';

interface TargetProfileProps {
  id: TargetProfileId;
  studentId: string | null;
  profileName: TargetProfileType;
  label: string;
  overallTarget: number | null;
  speakingTarget: number | null;
  writingTarget: number | null;
  readingTarget: number | null;
  listeningTarget: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TargetProfile extends AggregateRoot<TargetProfileId> {
  private props: TargetProfileProps;

  private constructor(props: TargetProfileProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    studentId: string | null,
    profileName: TargetProfileType,
    label: string,
    overallTarget: number | null,
    speakingTarget: number | null,
    writingTarget: number | null,
    readingTarget: number | null,
    listeningTarget: number | null,
    isActive: boolean = false
  ): TargetProfile {
    const now = new Date();
    return new TargetProfile({
      id: TargetProfileId.create(),
      studentId,
      profileName,
      label,
      overallTarget,
      speakingTarget,
      writingTarget,
      readingTarget,
      listeningTarget,
      isActive,
      createdAt: now,
      updatedAt: now
    });
  }

  static createFromPreset(
    studentId: string,
    preset: 'endorsement' | 'visascreen' | 'healthcare'
  ): TargetProfile {
    const presets = {
      endorsement: { label: 'Endorsement Minimum', overall: 55, speaking: 55, writing: null, reading: null, listening: null },
      visascreen: { label: 'VisaScreen / Work Visa', overall: 58, speaking: 59, writing: null, reading: null, listening: null },
      healthcare: { label: 'Healthcare Professional Preparation', overall: 58, speaking: 59, writing: null, reading: null, listening: null }
    };

    const p = presets[preset];
    return TargetProfile.create(
      studentId,
      preset,
      p.label,
      p.overall,
      p.speaking,
      p.writing,
      p.reading,
      p.listening,
      false
    );
  }

  static reconstitute(props: TargetProfileProps): TargetProfile {
    return new TargetProfile(props);
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateTargets(
    overallTarget?: number | null,
    speakingTarget?: number | null,
    writingTarget?: number | null,
    readingTarget?: number | null,
    listeningTarget?: number | null
  ): void {
    if (overallTarget !== undefined) this.props.overallTarget = overallTarget;
    if (speakingTarget !== undefined) this.props.speakingTarget = speakingTarget;
    if (writingTarget !== undefined) this.props.writingTarget = writingTarget;
    if (readingTarget !== undefined) this.props.readingTarget = readingTarget;
    if (listeningTarget !== undefined) this.props.listeningTarget = listeningTarget;
    this.props.updatedAt = new Date();
  }

  get studentId(): string | null { return this.props.studentId; }
  get profileName(): TargetProfileType { return this.props.profileName; }
  get label(): string { return this.props.label; }
  get overallTarget(): number | null { return this.props.overallTarget; }
  get speakingTarget(): number | null { return this.props.speakingTarget; }
  get writingTarget(): number | null { return this.props.writingTarget; }
  get readingTarget(): number | null { return this.props.readingTarget; }
  get listeningTarget(): number | null { return this.props.listeningTarget; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  getTargets(): Record<string, number | null> {
    return {
      overall: this.props.overallTarget,
      speaking: this.props.speakingTarget,
      writing: this.props.writingTarget,
      reading: this.props.readingTarget,
      listening: this.props.listeningTarget
    };
  }
}