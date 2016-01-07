import Item from "./Item";

export default class File extends Item {
  isDirectory() {
    // File is a directory if nlink is greater than 1.
    return this.get("nlink") > 1;
  }
}
