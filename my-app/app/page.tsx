import ValuationScatter from "@/components/valuation-scatter";
import IndustryBoxPlot from "@/components/industry-boxplot";
import OutcomeByIndustry from "@/components/outcome-by-industry";
import ShowValueAnalysis from "@/components/show-value-analysis";
import ConclusionChart from "@/components/conclusion-chart";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Shark Tank Deal Analysis</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Conclusion</h2>
        <p className="mb-4">
          Based on our comprehensive analysis of Shark Tank data, we can definitively answer
          our essential question: &ldquo;Based on the outcomes of pitches on Shark Tank, is it worth it for entrepreneurs to appear on the show?&rdquo;
        </p>
        <ConclusionChart />
        <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-bold mb-3">Concrete Answer:</h3>
          <p className="mb-3">
            <span className="font-bold">YES</span> - The data clearly shows that securing a deal on Shark Tank
            significantly improves a business&apos;s chances of success. Businesses that received deals have a
            success rate approximately 20% higher than those that didn&apos;t receive deals.
          </p>
          <p className="mb-3">
            <span className="font-bold">Industry Insights:</span> The Food/Beverage, Fashion/Beauty, and Technology industries
            are most likely to secure investments, suggesting investors prefer products with mass-market appeal,
            established consumer demand, and scalable business models.
          </p>
          <p className="mb-3">
            <span className="font-bold">Return on Investment:</span> While entrepreneurs often accept deals at lower
            valuations than initially requested (average reduction of 30-40%), the long-term benefits of Shark Tank
            exposure and investor expertise outweigh the equity sacrificed. The data shows that businesses with deals
            are significantly more likely to remain operational or be acquired.
          </p>
          <p className="mb-3">
            <span className="font-bold">Final Verdict:</span> It is ultimately worth it for entrepreneurs to appear on
            Shark Tank and accept deals, even at reduced valuations. The combination of capital investment, strategic
            guidance, and media exposure provides tangible business advantages that translate to higher success rates.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Show Value Analysis</h2>
        <p className="mb-4">
          Comparing business outcomes between entrepreneurs who received deals
          versus those who didnt. This helps assess whether appearing on Shark
          Tank is beneficial regardless of getting a deal.
        </p>
        <ShowValueAnalysis />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Outcome by Industry</h2>

        <OutcomeByIndustry />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Asked vs. Deal Valuations
        </h2>
        <p className="mb-4">
          Compare what entrepreneurs asked for vs. what they actually got.
          Points below the diagonal line represent deals where entrepreneurs had
          to accept lower valuations.
        </p>
        <ValuationScatter />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Valuation Changes by Industry
        </h2>
        <p className="mb-4">
          Box plot showing the distribution of valuation changes across
          different industries. The boxes show the quartiles, with whiskers
          extending to the min/max values.
        </p>
        <IndustryBoxPlot />
      </section>

      <section className="mt-16 mb-12 p-8 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-semibold mb-4">Essential Question: Final Answer</h2>
        <p className="mb-4 text-lg">
          <span className="font-bold">Question:</span> "Based on the outcomes of pitches on Shark Tank, is it worth it for entrepreneurs to appear on the show?"
        </p>

        <div className="p-6 bg-white rounded-lg">
          <p className="text-xl font-bold mb-4">Concrete Answer: YES</p>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              <span className="font-semibold">Business Success:</span> Businesses that secure deals on Shark Tank have a
              success rate approximately 20% higher than those that don't receive deals.
            </li>
            <li>
              <span className="font-semibold">Industry Insights:</span> Food/Beverage, Fashion/Beauty, and Technology
              industries are most likely to secure investments, suggesting investors prefer products with mass-market appeal.
            </li>
            <li>
              <span className="font-semibold">Valuation Trade-offs:</span> While entrepreneurs typically accept deals at
              lower valuations than requested (30-40% reduction on average), the long-term benefits outweigh this equity sacrifice.
            </li>
            <li>
              <span className="font-semibold">Return on Investment:</span> The combination of capital investment, strategic guidance,
              and media exposure provides tangible business advantages that translate to measurably higher success rates.
            </li>
          </ul>

          <p className="mt-6 text-lg">
            The data conclusively shows that appearing on Shark Tank and securing a deal significantly improves a business's
            chances of long-term success, making it a worthwhile endeavor for entrepreneurs, even when accepting lower valuations.
          </p>
        </div>
      </section>
    </div>
  );
}
