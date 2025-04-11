
import { useState, FormEvent, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface CurrencyConverterProps {
  setIsLoading: (isLoading: boolean) => void;
}

interface ConversionFormValues {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
}

// Common currency codes with their symbols
const CURRENCY_LIST = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
];

// Currency symbols mapping for formatting
const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCY_LIST.map(currency => [currency.code, currency.symbol])
);

const CurrencyConverter = ({ setIsLoading }: CurrencyConverterProps) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [usingNaturalLanguage, setUsingNaturalLanguage] = useState(true);

  const form = useForm<ConversionFormValues>({
    defaultValues: {
      amount: "100",
      fromCurrency: "USD",
      toCurrency: "EUR"
    }
  });

  const handleStructuredSubmit = async (data: ConversionFormValues) => {
    const { amount, fromCurrency, toCurrency } = data;
    const numericAmount = parseFloat(amount.replace(/,/g, ""));

    if (isNaN(numericAmount)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setIsLoading(true);
    setResult(null);

    try {
      // Using a free API that doesn't require API key
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${fromCurrency}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate data");
      }
      
      const data = await response.json();
      
      if (data && data.rates && data.rates[toCurrency]) {
        const rate = data.rates[toCurrency];
        const convertedAmount = numericAmount * rate;
        
        // Format the result nicely
        const formattedResult = formatCurrencyResult(
          numericAmount, 
          fromCurrency, 
          toCurrency, 
          convertedAmount
        );
        
        setResult(formattedResult);
      } else {
        throw new Error("Invalid conversion data received");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your currency. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setIsLoading(false);
    }
  };

  const handleNaturalLanguageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Please enter a query",
        description: "Try something like 'Convert 100 USD to EUR'",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setIsLoading(true);
    setResult(null);

    try {
      const extractionResult = extractCurrencyInfo(query);
      
      if (!extractionResult.success) {
        toast({
          title: "Couldn't understand query",
          description: extractionResult.error,
          variant: "destructive",
        });
        setIsConverting(false);
        setIsLoading(false);
        return;
      }

      const { amount, fromCurrency, toCurrency } = extractionResult;
      
      // Using a free API that doesn't require API key
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${fromCurrency}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate data");
      }
      
      const data = await response.json();
      
      if (data && data.rates && data.rates[toCurrency]) {
        const rate = data.rates[toCurrency];
        const convertedAmount = amount * rate;
        
        // Format the currencies properly
        const formattedResult = formatCurrencyResult(
          amount, 
          fromCurrency, 
          toCurrency, 
          convertedAmount
        );
        
        setResult(formattedResult);
      } else {
        throw new Error("Invalid conversion data received");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your currency. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Conversion Method</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={usingNaturalLanguage ? "default" : "outline"}
            onClick={() => setUsingNaturalLanguage(true)}
            className="flex-1"
          >
            Natural Language
          </Button>
          <Button
            variant={!usingNaturalLanguage ? "default" : "outline"}
            onClick={() => setUsingNaturalLanguage(false)}
            className="flex-1"
          >
            Structured Form
          </Button>
        </div>
      </div>

      {usingNaturalLanguage ? (
        <form onSubmit={handleNaturalLanguageSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              className="w-full p-4 text-lg"
              placeholder="E.g., Convert 100 USD to EUR"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isConverting}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
            disabled={isConverting}
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...
              </>
            ) : (
              "Convert Currency"
            )}
          </Button>
        </form>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStructuredSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="100.00"
                      type="text"
                      inputMode="decimal"
                      {...field}
                      disabled={isConverting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Currency</FormLabel>
                    <Select
                      disabled={isConverting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_LIST.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="toCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Currency</FormLabel>
                    <Select
                      disabled={isConverting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_LIST.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...
                </>
              ) : (
                "Convert Currency"
              )}
            </Button>
          </form>
        </Form>
      )}

      {result && (
        <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-800 mb-2">Conversion Result</h3>
            <p className="text-2xl font-bold text-blue-800">{result}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper function to extract currency information from the query
function extractCurrencyInfo(query: string) {
  // Common currency codes and aliases
  const currencyCodes = {
    "usd": "USD", "dollar": "USD", "dollars": "USD", "$": "USD",
    "eur": "EUR", "euro": "EUR", "euros": "EUR", "€": "EUR",
    "gbp": "GBP", "pound": "GBP", "pounds": "GBP", "£": "GBP",
    "jpy": "JPY", "yen": "JPY", "¥jpy": "JPY",
    "inr": "INR", "rupee": "INR", "rupees": "INR", "rs": "INR", "₹": "INR",
    "cad": "CAD", "canadian dollar": "CAD", "c$": "CAD",
    "aud": "AUD", "australian dollar": "AUD", "a$": "AUD",
    "chf": "CHF", "franc": "CHF", "francs": "CHF",
    "cny": "CNY", "yuan": "CNY", "rmb": "CNY", "¥cny": "CNY",
  };

  // Normalize query to lowercase
  const normalizedQuery = query.toLowerCase();
  
  // Amount regex - matching numbers with optional decimal points and commas
  const amountRegex = /\b(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)\b/;
  const amountMatch = normalizedQuery.match(amountRegex);
  
  if (!amountMatch) {
    return { 
      success: false, 
      error: "Couldn't identify an amount in your query. Please specify an amount to convert." 
    };
  }
  
  // Parse amount (removing commas)
  const amount = parseFloat(amountMatch[0].replace(/,/g, ""));
  
  // First, find currencies in the query
  let fromCurrency: string | null = null;
  let toCurrency: string | null = null;
  
  // Look for 'from X to Y' pattern or similar
  const conversionPatterns = [
    /from\s+(\w+)\s+to\s+(\w+)/i,
    /(\w+)\s+to\s+(\w+)/i,
    /convert\s+[^a-zA-Z]+\s+(\w+)\s+to\s+(\w+)/i,
    /exchange\s+[^a-zA-Z]+\s+(\w+)\s+to\s+(\w+)/i,
    /(\w+)\s+in\s+(\w+)/i,
  ];
  
  for (const pattern of conversionPatterns) {
    const match = normalizedQuery.match(pattern);
    if (match) {
      // Check if the matched words are currency codes or aliases
      const source = match[1].toLowerCase();
      const target = match[2].toLowerCase();
      
      if (currencyCodes[source]) {
        fromCurrency = currencyCodes[source];
      }
      
      if (currencyCodes[target]) {
        toCurrency = currencyCodes[target];
      }
      
      if (fromCurrency && toCurrency) {
        break;
      }
    }
  }
  
  // If we still don't have both currencies, scan for currency names/codes
  if (!fromCurrency || !toCurrency) {
    for (const [key, code] of Object.entries(currencyCodes)) {
      if (normalizedQuery.includes(key)) {
        if (!fromCurrency) {
          fromCurrency = code;
        } else if (!toCurrency && code !== fromCurrency) {
          toCurrency = code;
          break;
        }
      }
    }
  }
  
  // If we still can't identify both currencies, return an error
  if (!fromCurrency || !toCurrency) {
    return { 
      success: false, 
      error: "Please specify both the source and target currencies more clearly." 
    };
  }
  
  return {
    success: true,
    amount,
    fromCurrency,
    toCurrency
  };
}

// Helper function to format the currency result
function formatCurrencyResult(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  result: number
): string {
  // Format the amount with thousand separators
  const formattedAmount = new Intl.NumberFormat('en-US').format(amount);
  const formattedResult = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(result);

  const fromSymbol = CURRENCY_SYMBOLS[fromCurrency] || '';
  const toSymbol = CURRENCY_SYMBOLS[toCurrency] || '';

  // Construct the result string
  return `${fromSymbol}${formattedAmount} ${fromCurrency} is approximately ${toSymbol}${formattedResult} ${toCurrency} at the current exchange rate.`;
}

export default CurrencyConverter;
