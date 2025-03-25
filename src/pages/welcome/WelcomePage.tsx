
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSobrietyStartDate } from '@/utils/storage';
import WelcomeHeader from './components/WelcomeHeader';
import ProgressBar from './components/ProgressBar';
import WelcomeStep from './components/WelcomeStep';
import DateSelectionStep from './components/DateSelectionStep';
import AddictionSelectionStep from './components/AddictionSelectionStep';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [addiction, setAddiction] = useState<string>('');
  const totalSteps = 3;
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value));
  };
  
  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save data and redirect to dashboard
      setSobrietyStartDate(startDate);
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <WelcomeHeader />
      
      <ProgressBar step={step} totalSteps={totalSteps} />
      
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {step === 1 && <WelcomeStep handleContinue={handleContinue} />}
          
          {step === 2 && (
            <DateSelectionStep
              startDate={startDate}
              handleDateChange={handleDateChange}
              handleContinue={handleContinue}
            />
          )}
          
          {step === 3 && (
            <AddictionSelectionStep
              addiction={addiction}
              setAddiction={setAddiction}
              handleContinue={handleContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
