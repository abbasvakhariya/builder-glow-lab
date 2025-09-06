import { createContext, useContext, useMemo, useReducer, useEffect, ReactNode } from "react";

export type Role = "owner" | "manager" | "staff";
export type User = { id: string; name: string; email: string; role: Role };
export type Category = { id: string; name: string; parentId?: string | null };
export type Supplier = {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
};
export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  supplierId?: string;
  lowStockThreshold?: number;
  expiryDate?: string | null;
};
export type PurchaseItem = { productId: string; quantity: number; costPrice: number };
export type Purchase = {
  id: string;
  supplierId: string;
  date: string;
  items: PurchaseItem[];
  totalCost: number;
};
export type SaleItem = { productId: string; quantity: number; price: number };
export type Sale = {
  id: string;
  date: string;
  items: SaleItem[];
  discount?: number;
  tax?: number;
  totalAmount: number;
};

export type State = {
  users: User[];
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
};

type Action =
  | { type: "SET_STATE"; payload: State }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_SUPPLIER"; payload: Supplier }
  | { type: "UPDATE_SUPPLIER"; payload: Supplier }
  | { type: "DELETE_SUPPLIER"; payload: string }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_PURCHASE"; payload: Purchase }
  | { type: "ADD_SALE"; payload: Sale };

const STORAGE_KEY = "sms-small-store@v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;
    case "ADD_USER":
      return { ...state, users: [action.payload, ...state.users] };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
      };
    case "DELETE_USER":
      return { ...state, users: state.users.filter((u) => u.id !== action.payload) };
    case "ADD_CATEGORY":
      return { ...state, categories: [action.payload, ...state.categories] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };
    case "ADD_SUPPLIER":
      return { ...state, suppliers: [action.payload, ...state.suppliers] };
    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case "DELETE_SUPPLIER":
      return { ...state, suppliers: state.suppliers.filter((s) => s.id !== action.payload) };
    case "ADD_PRODUCT":
      return { ...state, products: [action.payload, ...state.products] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case "DELETE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };
    case "ADD_PURCHASE": {
      // Update stock on purchase
      const products = state.products.map((p) => {
        const item = action.payload.items.find((i) => i.productId === p.id);
        if (!item) return p;
        return { ...p, stock: p.stock + item.quantity, costPrice: item.costPrice };
      });
      return { ...state, purchases: [action.payload, ...state.purchases], products };
    }
    case "ADD_SALE": {
      // Decrease stock on sale
      const products = state.products.map((p) => {
        const item = action.payload.items.find((i) => i.productId === p.id);
        if (!item) return p;
        return { ...p, stock: Math.max(0, p.stock - item.quantity) };
      });
      return { ...state, sales: [action.payload, ...state.sales], products };
    }
    default:
      return state;
  }
}

function seed(): State {
  const now = new Date();
  const categories: Category[] = [
    { id: "cat-1", name: "Beverages" },
    { id: "cat-2", name: "Snacks" },
  ];
  const suppliers: Supplier[] = [
    { id: "sup-1", name: "Blue Ocean Suppliers", phone: "+1 202 555 0126" },
  ];
  const products: Product[] = [
    {
      id: "prod-1",
      name: "Cola Can 330ml",
      sku: "COLA-330",
      categoryId: "cat-1",
      unit: "pcs",
      costPrice: 0.4,
      sellingPrice: 0.99,
      stock: 120,
      supplierId: "sup-1",
      lowStockThreshold: 20,
      expiryDate: new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString(),
    },
    {
      id: "prod-2",
      name: "Potato Chips 45g",
      sku: "CHIP-45",
      categoryId: "cat-2",
      unit: "pcs",
      costPrice: 0.3,
      sellingPrice: 0.89,
      stock: 60,
      supplierId: "sup-1",
      lowStockThreshold: 15,
    },
  ];
  const users: User[] = [
    { id: "usr-1", name: "Store Owner", email: "owner@example.com", role: "owner" },
  ];
  return { users, categories, suppliers, products, purchases: [], sales: [] };
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as State;
    return parsed;
  } catch {
    return seed();
  }
}

function save(state: State) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const InventoryContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  utils: {
    nextId: (prefix: string) => string;
    totals: () => {
      totalStockValue: number;
      lowStockCount: number;
      todaysSales: number;
    };
  };
} | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as State, load);

  useEffect(() => save(state), [state]);

  const utils = useMemo(() => ({
    nextId: (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`,
    totals: () => {
      const totalStockValue = state.products.reduce(
        (sum, p) => sum + p.costPrice * p.stock,
        0,
      );
      const lowStockCount = state.products.filter(
        (p) => p.lowStockThreshold !== undefined && p.stock <= (p.lowStockThreshold || 0),
      ).length;
      const today = new Date().toDateString();
      const todaysSales = state.sales
        .filter((s) => new Date(s.date).toDateString() === today)
        .reduce((sum, s) => sum + s.totalAmount, 0);
      return { totalStockValue, lowStockCount, todaysSales };
    },
  }), [state]);

  const value = useMemo(() => ({ state, dispatch, utils }), [state, dispatch, utils]);
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
