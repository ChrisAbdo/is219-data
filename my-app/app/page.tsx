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
          Based on our analysis of Shark Tank data, we can definitively answer
          our essential question: &ldquo;Do entrepreneurs who secure deals on
          Shark Tank achieve better business outcomes than those who
          don&apos;t?&rdquo;
        </p>
        <ConclusionChart />
        <p className="mt-4 font-bold">
          The data clearly shows that securing a deal on Shark Tank
          significantly improves a business&apos;s chances of success. The
          answer is YES - it is worth it for entrepreneurs to appear on Shark
          Tank and secure a deal, even if they have to accept a lower valuation.
        </p>
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
    </div>
  );
}
