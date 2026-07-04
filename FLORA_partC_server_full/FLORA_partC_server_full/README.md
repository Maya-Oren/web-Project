FLORA Collective - חלק ג צד שרת

מה יש בפרויקט:
1. public - קבצי HTML, CSS, JS ותמונות של האתר.
2. index.js - שרת Express עם routes.
3. CRUD_functions.js - פונקציות טיפול בבקשות לקוח ושאילתות SQL.
4. db.config.js + db.js - חיבור ל-MySQL.
5. database/schema.sql - יצירת בסיס הנתונים והטבלאות.

הוראות הרצה:
1. לפתוח MySQL Workbench ולהריץ את הקובץ database/schema.sql.
2. לפתוח db.config.js ולעדכן את הסיסמה שלך ל-MySQL.
3. לפתוח טרמינל בתיקיית הפרויקט ולהריץ:
   npm install
   npm start
4. לפתוח בדפדפן:
   http://localhost:3000

Routes מרכזיים:
GET / - דף הבית
POST /api/users/register - הרשמה
POST /api/users/login - התחברות
POST /api/users/forgot-password - שמירת בקשת שחזור סיסמה
POST /api/contact - שמירת הודעת צור קשר
GET /api/contact - שליפת הודעות צור קשר
POST /api/orders - יצירת הזמנה ושמירת פריטי הזמנה
GET /api/orders?email=... - שליפת הזמנות לפי אימייל
PUT /api/orders/:orderNumber - עדכון סטטוס הזמנה
DELETE /api/orders/:orderNumber - מחיקת הזמנה

הנחות עבודה:
- הסיסמה נשמרת כטקסט רגיל כי בקבצי ההרצאה שניתנו לא הופיע נושא הצפנת סיסמאות.
- האתר נשאר בעברית ובאותו עיצוב, ורק נוסף חיבור צד שרת ו-MySQL.
