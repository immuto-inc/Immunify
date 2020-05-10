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

let covidData = [
  {
      subject: 'Shortness of breath', Personal: 0.1, Local: 0.4, National: 150,
  },
  {
    subject: 'Fever', Personal: 0.4, Local: 0.2, National: 150,
  },
  {
      subject: 'Coughing', Personal: 0.2, Local: 0.25, National: 150,
  },
  {
    subject: 'Muscle aches', Personal: 0.4, Local: 0.1, National: 150,
  },
  {
    subject: 'Sensory Loss', Personal: 0.25, Local: 0.9, National: 150,
  },
];

let moodData = [
  {
      subject: 'Anxiety', Personal: 86, Local: 130, National: 150,
  },
  {
    subject: 'Gratitude', Personal: 98, Local: 130, National: 150,
  },
  {
      subject: 'Happiness', Personal: 120, Local: 110, National: 150,
  },
  {
    subject: 'Positivity', Personal: 99, Local: 100, National: 150,
  },
  {
    subject: 'Sadness', Personal: 85, Local: 90, National: 150,
  },
  {
    subject: 'Stress', Personal: 85, Local: 90, National: 150,
  },
];

const VIEWS = ["Personal", "Local", "National"]
const ChartView = ({authToken, userInfo, profileInfo}) => {
  const [selectedView, setSelectedView] = useState("Personal")

  return (
    <div className="hidden-on-tiny"> 
    <h4> Immunify Data </h4>
       <Pagination className="mt-4">
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
      <Row className="align-items-center">

        <Col className="d-flex justify-content-center mt-2">
        <RadarChart cx={275} cy={190} outerRadius={150} width={500} height={400} data={covidData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar name={`${selectedView} COVID-19 Symptoms`} dataKey={selectedView} stroke="#105EA8" fill="#21a1da" fillOpacity={0.6} />
          <Legend/>
        </RadarChart>
        </Col>

        <Col className="d-flex justify-content-center mt-2">
        <RadarChart cx={275} cy={190} outerRadius={150} width={500} height={400} data={moodData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar name={`${selectedView} COVID-19 Symptoms`} dataKey={selectedView} stroke="#3c20a0" fill="#6f42c1" fillOpacity={0.6} />
          <Legend/>
        </RadarChart>
        </Col>
      </Row>


    <hr className="my-5"/>
    </div>
  );
}

export default ChartView;
