const CodeMirror = window.CodeMirror;
const Pos = CodeMirror.Pos;

export const selectNextOccurrence = (cm: any) => {
  var from = cm.getCursor("from"),
    to = cm.getCursor("to");
  var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
  if (CodeMirror.cmpPos(from, to) == 0) {
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

export const toggleCursorAtClick = (cm: CodeMirror.Editor, evt: MouseEvent) => {
  const selections = cm.listSelections();
  const clickPosition = cm.coordsChar({ left: evt.pageX, top: evt.pageY });
  // Keep track of whether we clicked in a selection
  let clickInSelection = false;
  // The new selections are all the selections that haven't just been clicked in
  const newSelections = selections.filter((range) => {
    const smallerThanHead = CodeMirror.cmpPos(range.from(), clickPosition) <= 0;
    const largerThanTail = CodeMirror.cmpPos(range.to(), clickPosition) >= 0;
    const wasClicked = smallerThanHead && largerThanTail;

    if (wasClicked) {
      clickInSelection = true;
    }

    return !wasClicked;
  });
  cm.setSelections(newSelections);

  // If we just clicked in a selection, prevent this event from bubbling.
  // That would cause the selection we just removed to be added again!
  if (clickInSelection) {
    evt.preventDefault();
  }
};

/*
  Helpers, stolen from CodeMirror
*/
function wordAt(cm: CodeMirror.Editor, pos: CodeMirror.Position) {
  var start = pos.ch,
    end = start,
    line = cm.getLine(pos.line);
  while (start && CodeMirror.isWordChar(line.charAt(start - 1))) --start;
  while (end < line.length && CodeMirror.isWordChar(line.charAt(end))) ++end;
  return {
    from: new Pos(pos.line, start),
    to: new Pos(pos.line, end),
    word: line.slice(start, end),
  };
}

function isSelectedRange(
  ranges: any[],
  from: CodeMirror.Position,
  to: CodeMirror.Position
) {
  for (var i = 0; i < ranges.length; i++)
    if (
      CodeMirror.cmpPos(ranges[i].from(), from) == 0 &&
      CodeMirror.cmpPos(ranges[i].to(), to) == 0
    )
      return true;
  return false;
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
