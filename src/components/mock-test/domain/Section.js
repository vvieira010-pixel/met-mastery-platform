export class Section {
  constructor({ id, label, time, icon }) {
    this.id = id;
    this.label = label;
    this.time = time;
    this.icon = icon;
  }

  isCompleted(completedSections) {
    return !!completedSections[this.id];
  }
}
