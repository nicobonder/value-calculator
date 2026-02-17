import React, { useState } from 'react';
import DataEntry from '../components/DataEntry';
import ScenarioSection from '../components/ScenarioSection';
import ResultsGrid from '../components/ResultsGrid';
import GrowthChart from '../components/GrowthChart';
import HelpModal from '../components/HelpModal';
import { useValuation } from '../hooks/useValuation';
import logo from '../assets/mba_logo.png';

const ExitMultiple = () => {
  const [showHelp, setShowHelp] = useState(false);
  const { 
    dataEntry, scenarios, analysis, 
    updateDataEntry, updateScenario, fetchTicker, calculate 
  } = useValuation();

  return (
    <main className="container">
      <div className='header-line'>
        <img src={logo} alt='logo' />
        <h1>Possible Future Value</h1>
        <button className="help-button" onClick={() => setShowHelp(true)}>?</button>
      </div>
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <DataEntry 
        data={dataEntry} 
        onChange={updateDataEntry} 
        onBlur={fetchTicker} 
      />

      <ScenarioSection 
        scenarios={scenarios} 
        onChange={updateScenario} 
      />

      <button className="btn-calculate" onClick={calculate}>
        Calculate Projection
      </button>

      {analysis.results && (
        <div className="results-section fade-in">
          <ResultsGrid results={analysis.results} />
          <GrowthChart data={analysis.timeline} />
        </div>
      )}
    </main>
  );
};

export default ExitMultiple;