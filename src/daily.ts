// 通知要否を判定
function shouldNotify(): boolean {
  if (!notifiedDatesSheet) {
    throw new Error("sheet not found! : __NOTIFIED_DATES__");
  }

  // 2行目・3列目から、最終行まで、1列取得（ = C列を最終行まで取得）
  // 1件でもTRUEがあればTRUE
  return notifiedDatesSheet
    .getRange(2, 3, lastRowIndex)
    .getValues()
    .some((row) => row[0]);
}

// 空白セルがないか確認
// 全て値が存在すればTRUE
// 存在しない場合はログ出力
function isRowFilled(row: string[]): boolean {
  if (row.every((cell) => cell)) {
    return true;
  }

  Logger.log("empty cell found... ");
  Logger.log(row.join(", "));

  return false;
}

// セルの内容を取得
// C列「通知対象か？」TRUEのものを先頭に
function getValuesShouldNotifyFirst(): string[][] {
  if (!notifiedDatesSheet) {
    throw new Error("sheet not found! : __NOTIFIED_DATES__");
  }

  // 2行目・1列目から、最終行まで、4列取得（ = A:D列を最終行まで取得）
  const allRange = notifiedDatesSheet
    .getRange(2, 1, lastRowIndex, 4)
    .getDisplayValues()
    .filter(isRowFilled) as string[][];

  // C列がTRUEの場合は先頭に
  // `getDisplayValues()` しているため、文字列 "TRUE" と比較する
  return [...allRange].sort((a) => (a[2] === "TRUE" ? -1 : 0));
}

// 通知メールの本文を生成
function composeNotificationBody(values: string[][]): string {
  const composedRows = values.map(
    (row) =>
      `${row[2] === "TRUE" ? "★ " : ""}${row[0]}の「${row[1]}」から${
        row[3]
      }日が経過しました`
  );

  return composedRows.join("\n");
}

// 件名を生成
// C列「通知対象か？」TRUEのものがあるかで分岐
function composeSubject(shouldNotify: boolean): string {
  if (shouldNotify) {
    return "【通知あり】nureba-iro(#000B00)[祝10,000日!]";
  }

  return "nureba-iro(#000B00)[祝10,000日!]（通知なし） ";
}

// 通知メールを送信
function notifyByEmail(): void {
  const notifiedEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFIED_EMAIL");
  if (!notifiedEmail) {
    Logger.log("failed to get notified email address...");
    return;
  }

  try {
    const values = getValuesShouldNotifyFirst();
    const notificationBody = composeNotificationBody(values);
    const subject = composeSubject(shouldNotify());

    Logger.log(
      `mail to be sent... notifiedEmail:${notifiedEmail} subject:${subject} notificationBody:${notificationBody}`
    );
    GmailApp.sendEmail(notifiedEmail, subject, notificationBody);
  } catch (e) {
    Logger.log(e);
  }
}
