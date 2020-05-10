import React, { useState } from "react";
import { 
    Container, 
    Row,
    Col,
    Pagination
} from "react-bootstrap";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';

const sampleData = [
  {
      subject: 'Shortness of breath', Personal: 86, Local: 130, National: 150,
  },
  {
    subject: 'Fever', Personal: 98, Local: 130, National: 150,
  },
  {
      subject: 'Coughing', Personal: 120, Local: 110, National: 150,
  },
  {
    subject: 'Muscle aches', Personal: 99, Local: 100, National: 150,
  },
  {
    subject: 'Loss of taste/smell', Personal: 85, Local: 90, National: 150,
  },
];

const VIEWS = ["Personal", "Local", "National"]
const ChartView = ({authToken, userInfo, profileInfo}) => {
  const [selectedView, setSelectedView] = useState("Personal")

  return (
    <div> 
    <h4> Immunify Data </h4>
      <div className="mt-3">
        <Pagination>
          {VIEWS.map((view, vIndex) => {
            return (    
              <Pagination.Item key={view} 
                               className={`w-25 text-center 
                                           ${vIndex === 0 ? "ml-auto" : ""}
                                           ${vIndex === VIEWS.length - 1 ? "mr-auto" : ""}
                              `}
                               active={view === selectedView}
                               onClick={() => setSelectedView(view)}>
                {view}
              </Pagination.Item>
            );
          })}

        </Pagination>
      </div>
      <RadarChart cx={300} cy={250} outerRadius={150} width={1000} height={500} data={sampleData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar name={selectedView} dataKey={selectedView} stroke="#105EA8" fill="#21a1da" fillOpacity={0.6} />
        <Legend/>
      </RadarChart>
    </div>
  );
}

export default ChartView;
