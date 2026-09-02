import { Section } from './Section.js';

export class TestSession {
  constructor({ sections, completedSections = {}, answers = {} }) {
    this.sections = sections.map(s => new Section(s));
    this.completedSections = completedSections;
    this.answers = answers;
  }

  startSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) throw new Error(`Section ${sectionId} not found`);
    return section;
  }

  completeSection(sectionId, sectionAnswers) {
    this.completedSections = {
      ...this.completedSections,
      [sectionId]: true
    };
    this.answers = {
      ...this.answers,
      ...sectionAnswers
    };
  }

  isAllDone() {
    return this.sections.every(s => s.isCompleted(this.completedSections));
  }

  getSection(sectionId) {
    return this.sections.find(s => s.id === sectionId);
  }

  toJSON() {
    return {
      completedSections: this.completedSections,
      answers: this.answers
    };
  }
}
