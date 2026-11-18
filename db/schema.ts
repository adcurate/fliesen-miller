import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  city: text("city").notNull().default(""),
  projectType: text("project_type").notNull(),
  area: text("area").notNull(),
  multiAreas: text("multi_areas").notNull().default("[]"),
  multiAreasDescription: text("multi_areas_description").notNull().default(""),
  size: text("size").notNull(),
  timeframe: text("timeframe").notNull(),
  details: text("details").notNull().default(""),
  sourcePage: text("source_page").notNull().default("/"),
  attribution: text("attribution").notNull().default("{}"),
  status: text("status").notNull().default("neu"),
  notes: text("notes").notNull().default(""),
  requesterHash: text("requester_hash").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  unsubscribed: integer("unsubscribed").notNull().default(0),
  notificationStatus: text("notification_status").notNull().default("legacy"),
  notificationSentAt: text("notification_sent_at").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [
  uniqueIndex("inquiries_idempotency_idx").on(table.idempotencyKey),
  uniqueIndex("inquiries_unsubscribe_idx").on(table.unsubscribeToken),
  index("inquiries_created_idx").on(table.createdAt),
  index("inquiries_rate_idx").on(table.requesterHash, table.createdAt),
]);

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  inquiryId: text("inquiry_id").notNull().references(() => inquiries.id, { onDelete: "cascade" }),
  objectKey: text("object_key").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
}, table => [index("attachments_inquiry_idx").on(table.inquiryId)]);
