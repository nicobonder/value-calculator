export const calculateScenarios = (dataEntry, scenarios) => {
    const keys = ['conservative', 'base', 'optimistic'];
    const results = {};
    const timeline = [];
  
    for (let i = 0; i <= dataEntry.horizon; i++) {
      const yearPoint = { year: `Year ${i}` };
      
      keys.forEach(key => {
        const scenario = scenarios[key];
        const growthDec = scenario.growth / 100;
        const marginDec = scenario.margin / 100;
        
        const projectedRev = dataEntry.revenue * Math.pow(1 + growthDec, i);
        const projectedFCF = projectedRev * marginDec;
        const projectedMktCap = projectedFCF * scenario.multiple;
        
        yearPoint[key] = i === 0 ? Number(dataEntry.marketCap) : Math.round(projectedMktCap);
        
        if (i === dataEntry.horizon) {
          const cagr = (Math.pow(projectedMktCap / dataEntry.marketCap, 1 / dataEntry.horizon) - 1) * 100;
          results[key] = {
            futureMktCap: Math.round(projectedMktCap), // Return a raw number, not a formatted string
            cagr: cagr.toFixed(2)
          };
        }
      });
      timeline.push(yearPoint);
    }
    return { results, timeline };
  };