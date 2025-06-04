// src/lib/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, boolean, integer, numeric, pgEnum  } from "drizzle-orm/pg-core";

// Define the role enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'cashier']);

// 1. Tabla de usuarios
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  role: userRoleEnum('role').notNull().default('cashier'), // Updated to use enum
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Tabla de sesiones (Lucia Auth)
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Tabla de usuarios oauth (opcional)
export const oauthUsers = pgTable("oauth_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  image: text("image"),
  provider: varchar("provider", { length: 50 }).notNull(),
  role: userRoleEnum('role').notNull().default("cashier"), // Updated to use enum
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Categorías
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Subcategorías
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Productos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  barcode: varchar("barcode", { length: 50 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 100 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").default(5),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id),
  subcategoryId: integer("subcategory_id").references(() => subcategories.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 7. Métodos de pago
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Ventas
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  saleNumber: varchar("sale_number", { length: 20 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  customerName: varchar("customer_name", { length: 255 }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  paymentReceived: numeric("payment_received", { precision: 10, scale: 2 }),
  changeAmount: numeric("change_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. Ítems de venta
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productBarcode: varchar("product_barcode", { length: 50 }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default("0"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 10. Movimientos de inventario
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  movementType: varchar("movement_type", { length: 20 }).notNull(), // sale, purchase, etc.
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  referenceId: integer("reference_id"),
  referenceType: varchar("reference_type", { length: 20 }),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
