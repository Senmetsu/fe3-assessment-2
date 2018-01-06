// https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4

var svg = d3.select("svg"),
  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand() //geeft aan dat er iets gaat gebeuren op de x as, hoeveel ruimte er tussen objecten komt te staan
  .rangeRound([0, width])
  .paddingInner(0.1);

var x1 = d3.scaleBand() //hoeveel padding er tussen de bars per "groep" komen te staan
  .padding(0.05);

var y = d3.scaleLinear() // y as lengte
  .rangeRound([height, 0]);

var z = d3.scaleOrdinal() // welke kleuren er voor de labels en bars gebruikt worden
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var body = d3.select("body");

//laad de data in.
d3.text("tps00010.tsv", function(error, data) {
  if (error) throw error;

  // maakt de data schoon door middel van regular expressions
  data = data.replace(/\t/g, ',')
  data = data.replace(/ +/g, '')
  data = data.replace(/b/g, '')
  data = data.replace(/p/g, '')
  data = data.replace(/e/g, '')
  data = data.replace('go\\tim', 'country')

  var dataCleaned = d3.csvParse(data, map)

  // zorgt ervoor dat de juiste data wordt gepakt.
  function map(d) {
    if (d.indic_d === "PC_Y0_14" && d.country === "NL" ||
      d.country === "BE" ||
      d.country === "DE") {
      return d;
    }

  };

  keyData = [2014, 2015, 2016];

  // Voegt de data toe op de x as.
  x0.domain(dataCleaned.map(function(d) {
    return d.country;
    console.log()
  }));

  var keys = keyData;

  // zet de  keys op de juiste plek.
  x1.domain(keys).rangeRound([0, x0.bandwidth()]); // https://github.com/d3/d3-scale#band_rangeRound
  y.domain([0, 50]) //.nice rond extreme nummers af - https://stackoverflow.com/questions/34930763/what-is-the-logic-behind-d3-js-nice-ticks

  // maakt groepen aan.
  g.append("g")
    //selecteerd alle "g's"
    .selectAll("g")
    // selecteerd de data
    .data(dataCleaned)
    // creeert elementen
    .enter()
    .append("g") //Maakt g elementen, elk met eigen data
    .attr("transform", function(d) {
      return "translate(" + x0(d.country) + ",0)";
    })
    .selectAll("rect")
    // zorgt ervoor dat de keys en values op de juiste plek staan voor de bars
    .data(function(d) {
      return keys.map(function(key) {
        return {
          key: key,
          value: d[key]
        };
      });
    })
    //maakt een rectangle aan
    .enter().append("rect")
    .attr("x", function(d) { // zorgt dat de x waardes worden meegegeven
      return x1(d.key);
    })
    // voegt data numb toe met een waarden
    .attr('data-numb', function(d) {
      return d.value
    })
    .attr("y", function(d) { //op de y as begint de rect
      return y(d.value);
    })
    .attr("width", x1.bandwidth()) // kijkt naar de bandwidth en maakt aan de hand daarvan zijn width.
    .attr("height", function(d) {
      return height - y(d.value); //hoogte van de bar wordt de grootte van de value en het wordt niet boven geplaatst
    })
    .attr("fill", function(d) {
      return z(d.key); //krijgt een kleur uit de z variabel
    });

  // zet de waardes van de landen op de juiste plek
  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0));

  // text
  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, "s")) //aantal stappen die het maakt op de y as
    .append("text")
    .attr("x", 2) //locatie tekst x as
    .attr("y", y(y.ticks().pop()) + 0.5) //locatie tekst y as
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Population");

  // maakt de legenda's aan.
  var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) {
      return d;
    });
});
