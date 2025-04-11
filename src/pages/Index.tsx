
import { useState } from "react";
import CurrencyConverter from "@/components/CurrencyConverter";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-teal-50">
      <header className="py-6 px-4 md:px-6 bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800">Currency Whisper AI</h1>
              <p className="text-gray-600 mt-1">Your intelligent currency conversion assistant</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Reg: 12312039</p>
              <p>Reg: 12321021</p>
              <p>Reg: 12317664</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
              Ask me to convert any currency
            </h2>
            
            <CurrencyConverter setIsLoading={setIsLoading} />
            
            <div className="mt-8 text-sm text-gray-500">
              <p className="mb-2">Try queries like:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>"Convert 10000 Indian Rupees to US Dollars"</li>
                <li>"How much is 200 USD in INR?"</li>
                <li>"Exchange 50 EUR to GBP"</li>
                <li>"What is the current exchange rate for USD to EUR?"</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 bg-blue-800 text-white">
        <div className="container mx-auto text-center">
          <p>Powered by Currency Whisper AI &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
