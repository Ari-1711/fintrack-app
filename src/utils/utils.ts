import { 
  Coffee, 
  Car, 
  Home, 
  Zap, 
  Film, 
  ShoppingBag, 
  HeartPulse, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Gift,
  HelpCircle
} from "lucide-react";

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food': return Coffee;
    case 'Transport': return Car;
    case 'Housing': return Home;
    case 'Utilities': return Zap;
    case 'Entertainment': return Film;
    case 'Shopping': return ShoppingBag;
    case 'Health': return HeartPulse;
    case 'Salary': return Briefcase;
    case 'Freelance': return DollarSign;
    case 'Investments': return TrendingUp;
    case 'Gift': return Gift;
    default: return HelpCircle;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
