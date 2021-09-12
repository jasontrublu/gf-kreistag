import './App.css';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { Pie, PieChart } from 'recharts';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState('');
  const [data2, setData2] = useState({});
  const seats = 58
  const [remainingSeats, setRemainingSeats] = useState(seats);
  const parties = {
    D1: 'party 1',
    D2: 'my party',
    D3: 'your party',
    D4: 'their party',
    D5: 'other party',
  }
  const rawdata = 'datum;wahl;ags;gebiet-nr;gebiet-name;max-schnellmeldungen;anz-schnellmeldungen;A1;A2;A3;A;B;B1;C;D;D1_summe_liste_kandidaten;D2_summe_liste_kandidaten;D3_summe_liste_kandidaten;D4_summe_liste_kandidaten;D5_summe_liste_kandidaten\n' +
    '15.10.2017;Landtagswahl;03151000;0;Landkreis Gifhorn;206;206;119699;15654;0;135353;85584;14657;600;2600;700;1000;400;300;200\n'

  const extracted = (extractedData) => {
    const res = []
    let tempRemainingSeats = seats
    let remainders = []
    for (let i = 1; i < 99; i++) {
      let key = 'D' + i + '_summe_liste_kandidaten';
      if (extractedData[key] !== undefined) {
        res[i] = {
          name: parties['D' + i],
          votes: extractedData[key],
          primarySeats: Math.floor(extractedData[key] * seats / extractedData['D']),
          seats: Math.floor(extractedData[key] * seats / extractedData['D']),
          value: Math.floor(extractedData[key] * seats / extractedData['D']),
          remainder: (extractedData[key] * seats % extractedData['D']) / extractedData['D'],
          remainderSeats: 0,
        }
        tempRemainingSeats = tempRemainingSeats - res[i].primarySeats
        remainders[i] = {
          remainder: res[i].remainder,
          party: i,
        }
        // console.log(res)
        // console.log(remainders)
      }
    }
    setRemainingSeats(tempRemainingSeats);
    remainders.sort((a, b) => a.remainder < b.remainder ? 1 : -1)
    console.log(remainders)
    for (let j = 0; j < tempRemainingSeats; j++) {
      // console.log(remainders[j])
      res[remainders[j].party].remainderSeats = 1;
      res[remainders[j].party].seats = res[remainders[j].party].primarySeats + 1;
      res[remainders[j].party].value = res[remainders[j].party].primarySeats + 1;
    }
    res.splice(0, 1)
    setData2(res);
  }

  useEffect(() => {
    Papa.parse(rawdata, {
      header: true,
      complete: function (results) {
        extracted(results.data[0]);
        setLoaded(true)
        setSource('example data')
      }
    });
  }, []);
  const handleFileUpload = e => {
    Papa.parse(e.target.files[0], {
      header: true,
      complete: function (results) {
        extracted(results.data[0]);
        setLoaded(true)
        setSource('file')
      }
    });
  }


  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>GF Kreistagswahl</h1>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />
          {
            loaded && <>
              {data2.map((party) =>
                <li>
                  {party.name}, votes = {party.votes}, seats = {party.primarySeats} + {party.remainderSeats}
                </li>
              )}
              <p>Source: {source}</p>
              <PieChart width={600} height={600}>
                <Pie
                  dataKey="value"
                  startAngle={210}
                  endAngle={-30}
                  data={data2}
                  cx={200}
                  cy={200}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                  animationBegin={10}
                  animationDuration={500}
                />
              </PieChart>
              {/*</ResponsiveContainer>*/}
            </>
          }
        </div>
      </header>
    </div>
  );
}

export default App;
