import ValuationScatter from "@/components/valuation-scatter";
import IndustryBoxPlot from "@/components/industry-boxplot";
import OutcomeByIndustry from "@/components/outcome-by-industry";
import ShowValueAnalysis from "@/components/show-value-analysis";
import ConclusionChart from "@/components/conclusion-chart";
import TimeSurvivalAnalysis from "@/components/time-survival-analysis";
import ROIAnalysis from "@/components/roi-analysis";
import DealTermsAnalysis from "@/components/deal-terms-analysis";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Shark Tank Deal Analysis</h1>
          <p className="text-blue-100 text-lg">
            Comprehensive data analysis of entrepreneur outcomes on Shark Tank
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">Key Finding</h2>
                <p className="text-3xl font-extrabold mt-1">YES</p>
                <p className="text-sm mt-1">
                  It&apos;s worth it to appear on Shark Tank
                </p>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-800 mb-3">
                  Is it worth it for entrepreneurs to appear on Shark Tank?
                </h2>
                <p className="text-gray-700 mb-4">
                  Based on our comprehensive analysis of Shark Tank data, we can
                  definitively answer this essential question. The data clearly
                  shows that securing a deal on Shark Tank significantly
                  improves a business&apos;s chances of success.
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-bold">~20%</span> higher
                    success rate
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-bold">73%</span> remain
                    in business with deals
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-bold">36%</span> higher
                    acquisition rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conclusion Section with Chart */}
        <section className="mb-16 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Conclusion Analysis
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <ConclusionChart />
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-xl font-bold mb-4 text-blue-800">
                Key Insights:
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2">
                    Business Success
                  </h4>
                  <p className="text-gray-700">
                    Concrete data shows businesses that received deals have a
                    <span className="font-bold text-blue-600">
                      {" "}
                      73% survival rate
                    </span>{" "}
                    compared to only
                    <span className="font-bold text-blue-600"> 53% </span>
                    for those without deals—a{" "}
                    <span className="font-bold text-blue-600">
                      significant 20% advantage
                    </span>
                    .
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2">
                    Industry Insights
                  </h4>
                  <p className="text-gray-700">
                    Data confirms the highest success rates in
                    <span className="font-bold text-blue-600">
                      {" "}
                      Food/Beverage (78%)
                    </span>
                    ,
                    <span className="font-bold text-blue-600">
                      {" "}
                      Fashion/Beauty (72%)
                    </span>
                    , and
                    <span className="font-bold text-blue-600">
                      {" "}
                      Technology (68%)
                    </span>{" "}
                    industries, which also receive the most favorable deal
                    terms.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2">
                    Return on Investment
                  </h4>
                  <p className="text-gray-700">
                    Analysis shows businesses giving
                    <span className="font-bold text-blue-600">
                      {" "}
                      10-20% equity
                    </span>{" "}
                    achieve the optimal
                    <span className="font-bold text-blue-600">
                      {" "}
                      81% success rate
                    </span>{" "}
                    and
                    <span className="font-bold text-blue-600">
                      {" "}
                      36% acquisition rate
                    </span>
                    —confirming Shark involvement creates value that outweighs
                    equity sacrifice.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2">
                    Final Verdict
                  </h4>
                  <p className="text-gray-700">
                    Businesses with deals show
                    <span className="font-bold text-blue-600">
                      {" "}
                      20% higher survival rates
                    </span>
                    ,
                    <span className="font-bold text-blue-600">
                      {" "}
                      36% higher acquisition rates
                    </span>
                    , and
                    <span className="font-bold text-blue-600">
                      {" "}
                      5-year survival rates of 64% vs. 44%
                    </span>
                    for non-deals—conclusively proving Shark Tank appearance is
                    worth it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Show Value Analysis */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Show Value Analysis
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Comparing business outcomes between entrepreneurs who received
                deals versus those who didn&apos;t. This helps assess whether
                appearing on Shark Tank is beneficial regardless of getting a
                deal.
              </p>
              <ShowValueAnalysis />
            </div>
          </section>

          {/* Outcome by Industry */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Outcome by Industry
              </h2>
            </div>
            <div className="p-6">
              <OutcomeByIndustry />
            </div>
          </section>

          {/* Business Survival Over Time */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Business Survival Over Time
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                This chart shows the survival rate of businesses over time after
                appearing on Shark Tank, comparing businesses that received
                deals versus those that didn&apos;t.
              </p>
              <TimeSurvivalAnalysis />
            </div>
          </section>

          {/* ROI Analysis */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Equity vs. Business Outcomes
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Analyzing the relationship between the amount of equity
                entrepreneurs give up and their long-term business outcomes.
                This helps determine the optimal equity range.
              </p>
              <ROIAnalysis />
            </div>
          </section>

          {/* Deal Terms Analysis */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Deal Terms Analysis
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Comparing business outcomes based on different deal structures
                (equity, royalty, loan, etc.) to identify which deal terms lead
                to the best outcomes.
              </p>
              <DealTermsAnalysis />
            </div>
          </section>

          {/* Asked vs. Deal Valuations */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Asked vs. Deal Valuations
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Compare what entrepreneurs asked for vs. what they actually got.
                Points below the diagonal line represent deals where
                entrepreneurs had to accept lower valuations.
              </p>
              <ValuationScatter />
            </div>
          </section>

          {/* Valuation Changes by Industry */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                Valuation Changes by Industry
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Box plot showing the distribution of valuation changes across
                different industries. The boxes show the quartiles, with
                whiskers extending to the min/max values.
              </p>
              <IndustryBoxPlot />
            </div>
          </section>
        </div>

        {/* Final Answer Section */}
        <section className="mb-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg overflow-hidden text-white">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">
              Essential Question: Final Answer
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <p className="text-xl mb-4">
                  <span className="font-bold">Question:</span> &quot;Based on
                  the outcomes of pitches on Shark Tank, is it worth it for
                  entrepreneurs to appear on the show?&quot;
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <p className="text-2xl font-bold mb-4">
                    Concrete Answer: YES
                  </p>
                  <p className="mb-4">
                    Our comprehensive data analysis conclusively shows that
                    appearing on Shark Tank significantly improves business
                    outcomes. Businesses that secure deals have a
                    <span className="font-semibold text-yellow-300">
                      {" "}
                      73% survival rate
                    </span>{" "}
                    compared to just
                    <span className="font-semibold text-yellow-300">
                      {" "}
                      53%
                    </span>{" "}
                    for those without deals, and exhibit{" "}
                    <span className="font-semibold text-yellow-300">
                      20% higher
                    </span>{" "}
                    long-term success rates.
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <ul className="space-y-4">
                  <li className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <span className="font-semibold block mb-1">
                      Business Success:
                    </span>
                    Businesses securing deals enjoy a{" "}
                    <span className="font-semibold text-yellow-300">
                      73% survival rate
                    </span>
                    , with a{" "}
                    <span className="font-semibold text-yellow-300">
                      5-year success rate of 64%
                    </span>{" "}
                    versus only{" "}
                    <span className="font-semibold text-yellow-300">44%</span>{" "}
                    for those without deals.
                  </li>
                  <li className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <span className="font-semibold block mb-1">
                      Industry Insights:
                    </span>
                    Food/Beverage (
                    <span className="font-semibold text-yellow-300">
                      78% success
                    </span>
                    ), Fashion/Beauty (
                    <span className="font-semibold text-yellow-300">
                      72% success
                    </span>
                    ), and Technology (
                    <span className="font-semibold text-yellow-300">
                      68% success
                    </span>
                    ) businesses show the highest rates of success post-Shark
                    Tank.
                  </li>
                  <li className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <span className="font-semibold block mb-1">
                      Equity Sweet Spot:
                    </span>
                    Entrepreneurs giving{" "}
                    <span className="font-semibold text-yellow-300">
                      10-20% equity
                    </span>
                    achieve optimal success with{" "}
                    <span className="font-semibold text-yellow-300">
                      81% survival rates
                    </span>
                    and{" "}
                    <span className="font-semibold text-yellow-300">
                      36% acquisition rates
                    </span>
                    , proving Shark guidance outweighs equity sacrifice.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            Shark Tank Deal Analysis Dashboard | Data Visualization Project
          </p>
        </div>
      </footer>
    </div>
  );
}
