export class Answer {
  constructor(sectionId, data) {
    this.sectionId = sectionId;
    this.data = data; // Can be a single value or an object of answers for that section
  }
}
