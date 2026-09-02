import { TestSession } from '../domain/TestSession.js';

export class MockTestUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async loadSession(studentId, sections) {
    const savedData = await this.repository.load(studentId);
    if (savedData) {
      return new TestSession({
        sections,
        ...savedData
      });
    }
    return new TestSession({ sections });
  }

  async saveProgress(studentId, session) {
    await this.repository.save(studentId, session.toJSON());
  }

  async completeSection(studentId, sectionId, sectionAnswers, session) {
    session.completeSection(sectionId, sectionAnswers);
    await this.repository.save(studentId, session.toJSON());
    return session;
  }
}
