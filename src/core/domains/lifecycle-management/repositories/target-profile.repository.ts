import { TargetProfile } from '../entities/target-profile.entity';
import { TargetProfileId } from '../value-objects/target-profile-id.vo';

export interface ITargetProfileRepository {
  save(profile: TargetProfile): Promise<void>;
  findById(id: TargetProfileId): Promise<TargetProfile | null>;
  findByStudentId(studentId: string): Promise<TargetProfile[]>;
  findActiveByStudentId(studentId: string): Promise<TargetProfile | null>;
  findByProfileName(profileName: string): Promise<TargetProfile[]>;
  delete(id: TargetProfileId): Promise<void>;
}