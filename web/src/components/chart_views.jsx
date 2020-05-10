import React, { useState, useEffect } from "react";
import { 
    Row,
    Col,
    Pagination
} from "react-bootstrap";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';

const DEFAULT_COVID_DATA = [
  {
      subject: 'Shortness of breath', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Fever', Personal: 0, Local: 0, National: 0,
  },
  {
      subject: 'Coughing', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Muscle aches', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Sensory loss', Personal: 0, Local: 0, National: 0,
  },
];

const DEFAULT_MOOD_DATA = [
  {
      subject: 'Anxiety', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Gratitude', Personal: 0, Local: 0, National: 0,
  },
  {
      subject: 'Happiness', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Positivity', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Sadness', Personal: 0, Local: 0, National: 0,
  },
  {
    subject: 'Stress', Personal: 0, Local: 0, National: 0,
  },
];

const NOISE_BUFF = 0.05

function load_personal_results(surveyResults, covidData, setCovidData, moodData, setMoodData) {
  if (surveyResults["COVID"].length === 0 && surveyResults["MOOD"].length === 0) return;

  console.log("loading personal results")
  console.log(surveyResults)
  let covidResults = surveyResults["COVID"]
  let covidTotals = { 
    'Shortness of breath': 0, 
    'Fever': 0, 
    "Coughing": 0, 
    "Muscle aches": 0, 
    "Sensory loss": 0
  }
  let moodResults = surveyResults["MOOD"]
  let moodTotals = { Anxiety: 0, Gratitude: 0, Happiness: 0, Positivity: 0, Sadness: 0, Stress: 0 }

  covidResults.map(question => {
    question.map(answers => {
      if (typeof answers === "object") {
        answers.map(answer => {
          if (answer === "Loss of taste or smell") { answer = "Sensory loss" }
          if (answer in covidTotals) {
            covidTotals[answer] += 1
          }
          return ''
        })
      }
      return ''
    })
    return ''
  })
  // normalize by total responses
  for (let field in covidTotals) {
    for (let component of covidData) {
      if (component.subject === field) {
        component.Personal = covidResults.length ? covidTotals[field] / covidResults.length : 0
      }
    }
  }
  setCovidData(covidData)

  moodResults.map(question => {
    question.map(answers => {
      if (typeof answers === "object") {
        answers.map(answer => {
        if (answer in moodTotals) {
          moodTotals[answer] += 1
        }
        return ''
      })}
      return ''
    })
    return ''
  })
  // normalize by total responses
  for (let field in moodTotals) {
    for (let component of moodData) {
      if (component.subject === field) {
        component.Personal = moodResults.length ? moodTotals[field] / moodResults.length : 0
      }
    }
  }
  setMoodData(moodData)
}

function load_local_national_results(userZIP, aggregateResults, covidData, setCovidData, moodData, setMoodData) {
  let covidResults = aggregateResults["COVID"]
  let covidTotals = { 
    'Shortness of breath': 0, 
    'Fever': 0, 
    "Coughing": 0, 
    "Muscle aches": 0, 
    "Sensory loss": 0
  }
  let localCovidTotals = { 
    'Shortness of breath': 0, 
    'Fever': 0, 
    "Coughing": 0, 
    "Muscle aches": 0, 
    "Sensory loss": 0
  }
  let moodResults = aggregateResults["MOOD"]
  let moodTotals = { Anxiety: 0, Gratitude: 0, Happiness: 0, Positivity: 0, Sadness: 0, Stress: 0 }
  let localMoodTotals = { Anxiety: 0, Gratitude: 0, Happiness: 0, Positivity: 0, Sadness: 0, Stress: 0 }

  let localTotal = 0
  if (covidResults.length) {
    covidResults.map((question, qIndex) => {
      const answerZIP = question[question.length - 1]
      if (answerZIP === userZIP) {
        localTotal++
      }

      question.map(answers => {
        if (typeof answers === "object") {
          answers.map(answer => {
          if (answer === "Loss of taste or smell") { answer = "Sensory loss" }
          if (answer in covidTotals) {
            covidTotals[answer] += 1

            if (answerZIP === userZIP) {
              localCovidTotals[answer] += 1
            }
          }
          return ''
        })}
        return ''
      })
      return ''
    })

    // normalize by total responses
    for (let field in covidTotals) {
      for (let component of covidData) {
        if (component.subject === field) {
          component.National = covidTotals[field] / covidResults.length
          if (component.National === 0) component.National = NOISE_BUFF // a bit of noise, graphic enhancement
          component.Local = localTotal > 0 ? localCovidTotals[field] / localTotal : 0
          if (component.Local === 0) component.Local = NOISE_BUFF // a bit of noise, graphic enhancement
        }
      }
    }
    setCovidData(covidData)
  }

  localTotal = 0
  if (moodResults.length) {
    moodResults.map((question, qIndex) => {
      const answerZIP = question[question.length - 1]
      if (answerZIP === userZIP) {
        localTotal++
      }

      question.map(answers => {
        if (typeof answers === "object") {
          answers.map(answer => {
          if (answer in moodTotals) {
            moodTotals[answer] += 1

            if (answerZIP === userZIP) {
              localMoodTotals[answer] += 1
            }
          }
          return ''
        })}
        return ''
      })
      return ''
    })
    // normalize by total responses
    for (let field in moodTotals) {
      for (let component of moodData) {
        if (component.subject === field) {
          component.National = moodTotals[field] / moodResults.length
          if (component.National === 0) component.National = NOISE_BUFF // a bit of noise, graphic enhancement
          component.Local = localTotal > 0 ? localMoodTotals[field] / localTotal : 0
          if (component.Local === 0) component.Local = NOISE_BUFF // a bit of noise, graphic enhancement
        }
      }
    }
    setMoodData(moodData)
  }
}

const VIEWS = ["Personal", "Local", "National"]

const ChartView = ({profileInfo, surveyResults, aggregateResults}) => {
  const [selectedView, setSelectedView] = useState("Local")
  const [covidData, setCovidData] = useState(DEFAULT_COVID_DATA)
  const [moodData, setMoodData] = useState(DEFAULT_MOOD_DATA)

  useEffect(() => { 
    if (!profileInfo) return;
     
    load_local_national_results(profileInfo[2] /* user ZIP */, aggregateResults, covidData, setCovidData, moodData, setMoodData)
  }, [aggregateResults, covidData, moodData, profileInfo]);

  useEffect(() => { 
    load_personal_results(surveyResults, covidData, setCovidData, moodData, setMoodData)
  }, [surveyResults, covidData, moodData]);



  if (!profileInfo) {
    return <div>
      Loading Immunify data...
    </div>
  }

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
          <Radar name={`${selectedView} Mood Data`} dataKey={selectedView} stroke="#3c20a0" fill="#6f42c1" fillOpacity={0.6} />
          <Legend/>
        </RadarChart>
        </Col>
      </Row>


    <hr className="my-5"/>
    </div>
  );
}

export default ChartView;
