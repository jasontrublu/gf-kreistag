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
  const [partyResults, setPartyResults] = useState({});
  const seats = 58
  const parties = {
    D1: 'CDU',
    D2: 'SPD',
    D3: 'Grüne',
    D4: 'AfD',
    D5: 'Unabhängige',
    D6: 'FDP',
    D7: 'Die Linke',
    D8: 'Die Basis',
    D9: 'BIG Sassenburg',
    D10: 'LKR',
    D11: 'ÖDP',
    D12: 'Die Partei',
  }
  const extracted = (extractedData) => {
    const res = []
    let remainingSeats = seats
    let remainders = []
    const totalVotes = extractedData['D'] > 0 ? extractedData['D'] : 0
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
        if (totalVotes === 0) {
          res[i].seats = 0
          res[i].remainder = 0
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
    setPartyResults(res);
  }
  useEffect(() => {
    fileFromServer()
  }, []);
  const fileFromServer = () => {
    Papa.parse(URL + '/Open-Data-Kreiswahl-NDS2191.csv', {
      download: true,
      header: true,
      complete: function (results) {
        console.log(results);
        extracted(results.data[0]);
        setLoaded(true)
      }
    });
  }

  return (
    <>
      <header className="App-header">
        <h1>GF Kreistagswahl</h1>
      </header>
      <Container maxWidth="sm">
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
                  {partyResults.map((party) => (
                    <TableRow key={party.name}>
                      <TableCell component="th" scope="row">{party.name}</TableCell>
                      <TableCell align="right">{party.votes}</TableCell>
                      <TableCell align="right">{party.seats}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <PieChart width={600} height={600}>
              <Pie
                dataKey="value"
                startAngle={210}
                endAngle={-30}
                data={partyResults}
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
