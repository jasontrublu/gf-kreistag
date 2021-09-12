import './App.css';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { Pie, PieChart } from 'recharts';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Container } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 150,
  },
});
const URL = `${process.env.REACT_APP_URL}`;

const App = () => {
  const classes = useStyles();
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState('');
  const [data2, setData2] = useState({});
  const seats = 58
  const parties = {
    D1: 'party 1',
    D2: 'my party',
    D3: 'your party',
    D4: 'their party',
    D5: 'other party',
    D6: 'other party',
    D7: 'other party',
    D8: 'other party',
    D9: 'other party',
    D10: 'other party',
    D11: 'other party',
    D12: 'other party',
  }
  const rawdata = 'datum;wahl;ags;gebiet-nr;gebiet-name;max-schnellmeldungen;anz-schnellmeldungen;A1;A2;A3;A;B;B1;C;D;D1_summe_liste_kandidaten;D2_summe_liste_kandidaten;D3_summe_liste_kandidaten;D4_summe_liste_kandidaten;D5_summe_liste_kandidaten\n' +
    '15.10.2017;Landtagswahl;03151000;0;Landkreis Gifhorn;206;206;119699;15654;0;135353;85584;14657;600;2600;700;1000;400;300;200\n'

  const extracted = (extractedData) => {
    const res = []
    let remainingSeats = seats
    let remainders = []
    const totalVotes = extractedData['D']
    for (let i = 1; i < 99; i++) {
      let key = 'D' + i + '_summe_liste_kandidaten';
      if (extractedData[key] !== undefined) {
        res[i] = {
          name: parties['D' + i],
          votes: extractedData[key],
          primarySeats: Math.floor(extractedData[key] * seats / totalVotes),
          seats: Math.floor(extractedData[key] * seats / totalVotes),
          value: Math.floor(extractedData[key] * seats / totalVotes),
          remainder: (extractedData[key] * seats % totalVotes) / totalVotes,
          remainderSeats: 0,
        }
        remainingSeats = remainingSeats - res[i].primarySeats
        remainders[i] = {
          remainder: res[i].remainder,
          party: i,
        }
      }
    }
    if (totalVotes > 0 && remainders.length > remainingSeats) {
      remainders.sort((a, b) => a.remainder < b.remainder ? 1 : -1)
      console.log(remainders)
      for (let j = 0; j < remainingSeats; j++) {
        res[remainders[j].party].remainderSeats = 1;
        res[remainders[j].party].seats = res[remainders[j].party].primarySeats + 1;
        res[remainders[j].party].value = res[remainders[j].party].primarySeats + 1;
      }
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
    console.log("file upload");
    Papa.parse(e.target.files[0], {
      header: true,
      complete: function (results) {
        console.log(results);
        extracted(results.data[0]);
        setLoaded(true)
        setSource('uploaded file')
      }
    });
  }
  const fileFromServer = () => {
    Papa.parse(URL + '/Open-Data-Kreiswahl-NDS2191.csv', {
      download: true,
      complete: function (results) {
        console.log(results);
        extracted(results.data[0]);
        setLoaded(true)
        setSource('server')
      }
    });
  }

  return (
    <>
      <header className="App-header">
        <h1>GF Kreistagswahl</h1>
      </header>
      <Container maxWidth="sm">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
        />
        <br/>
        <button onClick={fileFromServer}>
          Load from server
        </button>
        <br/>
        {
          loaded && <>
            <TableContainer component={Paper}>
              <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>Party</TableCell>
                    <TableCell align="right">votes</TableCell>
                    <TableCell align="right">seats</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data2.map((party) => (
                    <TableRow key={party.name}>
                      <TableCell component="th" scope="row">{party.name}</TableCell>
                      <TableCell align="right">{party.votes}</TableCell>
                      <TableCell align="right">{party.seats}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
      </Container>
    </>
  );
}

export default App;
