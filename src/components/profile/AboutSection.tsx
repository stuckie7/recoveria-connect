
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <div className="glass-card mb-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between p-2">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          
          <div className="flex justify-between p-2">
            <span className="text-muted-foreground">Last updated</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between p-2">
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </div>
          
          <div className="flex justify-between p-2">
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
