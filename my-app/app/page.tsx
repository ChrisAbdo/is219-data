import ValuationScatter from "@/components/valuation-scatter";
import IndustryBoxPlot from "@/components/industry-boxplot";
import OutcomeByIndustry from "@/components/outcome-by-industry";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Shark Tank Deal Analysis</h1>

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
