export const selectNextOccurrence = (cm: any) => {
  var from = cm.getCursor("from"),
    to = cm.getCursor("to");
  var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
  if (Pos.cmp(from, to) == 0) {
    var word = wordAt(cm, from);
    if (!word.word) return;
    cm.setSelection(word.from, word.to);
    fullWord = true;
  } else {
    var text = cm.getRange(from, to);
    var query = fullWord ? new RegExp("\\b" + text + "\\b") : text;
    var cur = cm.getSearchCursor(query, to);
    var found = cur.findNext();
    if (!found) {
      cur = cm.getSearchCursor(query, new Pos(cm.firstLine(), 0));
      found = cur.findNext();
    }
    if (!found || isSelectedRange(cm.listSelections(), cur.from(), cur.to()))
      return;
    cm.addSelection(cur.from(), cur.to());
  }
  if (fullWord) cm.state.sublimeFindFullWord = cm.doc.sel;
};

export const addCursorToPrevLine = (cm: CodeMirror.Editor) =>
  addCursorToSelection(cm, -1);

export const addCursorToNextLine = (cm: CodeMirror.Editor) =>
  addCursorToSelection(cm, 1);

export const toggleCursorAtClick = (cm: CodeMirror.Editor) => {
  console.log("CLICK");
};

/*
  Helpers, stolen from CodeMirror
*/
function wordAt(cm: CodeMirror.Editor, pos: CodeMirror.Position) {
  var start = pos.ch,
    end = start,
    line = cm.getLine(pos.line);
  while (start && isWordChar(line.charAt(start - 1))) --start;
  while (end < line.length && isWordChar(line.charAt(end))) ++end;
  return {
    from: new Pos(pos.line, start),
    to: new Pos(pos.line, end),
    word: line.slice(start, end),
  };
}

class Pos {
  line: number;
  ch: number;
  sticky?: string | null;

  constructor(line: number, ch: number, sticky: string = null) {
    if (!(this instanceof Pos)) {
      return new Pos(line, ch, sticky);
    }
    this.line = line;
    this.ch = ch;
    this.sticky = sticky;
  }

  static cmp(a: CodeMirror.Position, b: CodeMirror.Position) {
    return a.line - b.line || a.ch - b.ch;
  }
}

function isSelectedRange(
  ranges: any[],
  from: CodeMirror.Position,
  to: CodeMirror.Position
) {
  for (var i = 0; i < ranges.length; i++)
    if (
      Pos.cmp(ranges[i].from(), from) == 0 &&
      Pos.cmp(ranges[i].to(), to) == 0
    )
      return true;
  return false;
}

let nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
function isWordCharBasic(ch: string) {
  return (
    /\w/.test(ch) ||
    (ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() ||
        nonASCIISingleCaseWordChar.test(ch)))
  );
}
function isWordChar(ch: string, helper?: any) {
  if (!helper) return isWordCharBasic(ch);
  if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) return true;
  return helper.test(ch);
}

function addCursorToSelection(cm: any, dir: number) {
  var ranges = cm.listSelections(),
    newRanges = [];
  for (var i = 0; i < ranges.length; i++) {
    var range = ranges[i];
    var newAnchor = cm.findPosV(
      range.anchor,
      dir,
      "line",
      range.anchor.goalColumn
    );
    var newHead = cm.findPosV(range.head, dir, "line", range.head.goalColumn);
    newAnchor.goalColumn =
      range.anchor.goalColumn != null
        ? range.anchor.goalColumn
        : cm.cursorCoords(range.anchor, "div").left;
    newHead.goalColumn =
      range.head.goalColumn != null
        ? range.head.goalColumn
        : cm.cursorCoords(range.head, "div").left;
    var newRange = { anchor: newAnchor, head: newHead };
    newRanges.push(range);
    newRanges.push(newRange);
  }
  cm.setSelections(newRanges);
}
