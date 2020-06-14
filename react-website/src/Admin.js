import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css';
import './assets/css/styles.min.css'


class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            busList: [],
            trainList: [],
            planeList: [],
            busStart: "",
            busEnd: "",
            busOrigin: "",
            busDestination: "",
            trainStart: "",
            trainEnd: "",
            trainOrigin: "",
            trainDestination: "",
            planeStart: "",
            planeEnd: "",
            planeOrigin: "",
            planeDestination: "",
            busDimensions: "",
            trainDimensions: "",
            planeDimensions: "",
        }
    }

    async componentDidMount() {
        let busResponse = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'bus'
            }
        })
            .catch(err => console.log(err))
        let busJson = await busResponse.json();
        try {
            this.setState({ busList: busJson.data });
        } catch (e) {
            console.log(e);
            this.state = {
                busList: busJson.data
            }
        }

        let trainResponse = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'train'
            }
        })
            .catch(err => console.log(err))
        let trainJson = await trainResponse.json();
        try {
            this.setState({ trainList: trainJson.data });
        } catch (e) {
            console.log(e);
            this.state = {
                trainList: trainJson.data
            }
        }

        let planeResponse = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'plane'
            }
        })
            .catch(err => console.log(err))
        let planeJson = await planeResponse.json();
        try {
            this.setState({ planeList: planeJson.data });
        } catch (e) {
            console.log(e);
            this.state = {
                planeList: planeJson.data
            }
        }
    }

    async refresh() {
        let busResponse = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'bus'
            }
        })
            .catch(err => console.log(err))
        let busJson = await busResponse.json();
        try {
            this.setState({ busList: busJson.data });
        } catch (e) {
            console.log(e);
            this.state = {
                busList: busJson.data
            }
        }

        let trainResponse = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'train'
            }
        })
            .catch(err => console.log(err))
        let trainJson = await trainResponse.json();
        try {
            this.setState({ trainList: trainJson.data });
        } catch (e) {
            console.log(e);
            this.state = {
                trainList: trainJson.data
            }
        }

        let planeResponse = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'plane'
            }
        })
            .catch(err => console.log(err))
        let planeJson = await planeResponse.json();
        try {
            this.setState({ planeList: planeJson.data });
        } catch (e) {
            console.log(e);
            this.state = {
                planeList: planeJson.data
            }
        }
    }

    changeBusStart(event){
        this.setState({busStart: event.target.value});
    }

    changeBusEnd(event){
        this.setState({busEnd: event.target.value});
    }

    changeBusOrigin(event){
        this.setState({busOrigin: event.target.value});
    }

    changeBusDestination(event){
        this.setState({busDestination: event.target.value});
    }

    changeTrainStart(event){
        this.setState({trainStart: event.target.value});
    }

    changeTrainEnd(event){
        this.setState({trainEnd: event.target.value});
    }

    changeTrainOrigin(event){
        this.setState({trainOrigin: event.target.value});
    }

    changeTrainDestination(event){
        this.setState({trainDestination: event.target.value});
    }

    changePlaneStart(event){
        this.setState({planeStart: event.target.value});
    }

    changePlaneEnd(event){
        this.setState({planeEnd: event.target.value});
    }

    changePlaneOrigin(event){
        this.setState({planeOrigin: event.target.value});
    }

    changePlaneDestination(event){
        this.setState({planeDestination: event.target.value});
    }

    changeBusDimensions(event){
        this.setState({busDimensions: event.target.value});
    }

    changeTrainDimensions(event){
        this.setState({trainDimensions: event.target.value});
    }

    changePlaneDimensions(event){
        this.setState({planeDimensions: event.target.value});
    }

    async submitBus(event){
        let response = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/newVehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'bus',
                'startlocation':this.state.busOrigin,
                'destination':this.state.busDestination,
                'starttimes':this.state.busStart,
                'endtimes':this.state.busEnd,
                'dimensions':this.state.busDimensions
            }
        })
            .catch(err => console.log(err))
        this.refresh();
        return false;
    }

    async submitTrain(event){
        let response = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/newVehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'train',
                'startlocation':this.state.trainOrigin,
                'destination':this.state.trainDestination,
                'starttimes':this.state.trainStart,
                'endtimes':this.state.trainEnd,
                'dimensions':this.state.trainDimensions
            }
        })
            .catch(err => console.log(err))
        this.refresh();
        return false;
    }

    async submitPlane(event){
        let response = await fetch('https://safetravels.macrotechsolutions.us:9146/http://localhost/newVehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'type': 'plane',
                'startlocation':this.state.planeOrigin,
                'destination':this.state.planeDestination,
                'starttimes':this.state.planeStart,
                'endtimes':this.state.planeEnd,
                'dimensions':this.state.planeDimensions
            }
        })
            .catch(err => console.log(err))
        this.refresh();
        return false;
    }

    render() {
        return (
            <div id='page-top' >
                <nav className="navbar navbar-light navbar-expand-lg fixed-top" id="mainNav">
                    <div className="container"><a className="navbar-brand js-scroll-trigger"
                        href="./">SafeTravels</a><button className="navbar-toggler
                            navbar-toggler-right" data-toggle="collapse" type="button"
                            data-target="#navbarResponsive"
                            aria-controls="navbarResponsive" aria-expanded="false"
                            aria-label="Toggle navigation"><i className="fa
                                fa-align-justify"></i></button></div>
                </nav>
                <section id="about" style={{ backgroundColor: "#0079C6", opacity: "1" }}>
                    <div className="container">
                        <div className="row">
                            <div className="col offset-lg-8 mx-auto text-center">
                                <div>
                                    <h2 className="text-white section-heading"
                                        style={{ backgroundColor: "rgba(222,41,41,0)", height: '38px' }}>Buses</h2>
                                    <hr className="light my-4"></hr>
                                </div>
                                <div className="table-responsive">
                                    <table style={{color: "white"}} className="table" id="current">
                                        <thead>
                                            <tr>
                                                <th>Start Time</th>
                                                <th>End Time</th>
                                                <th>Origin</th>
                                                <th>Destination</th>
                                                <th>Dimensions</th>
                                                <th>Risk</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.busList.map(
                                                function (data, index) {
                                                    return (<tr>
                                                        <td>{data.starttimes}</td>
                                                        <td>{data.endtimes}</td>
                                                        <td>{data.startlocation}</td>
                                                        <td>{data.destination}</td>
                                                        <td>{data.dimensions}</td>
                                                        <td>{data.risk}</td>
                                                    </tr>)
                                                })
                                            }
                                            <tr>
                                                <td><input onChange={this.changeBusStart.bind(this)} placeholder="Start Time"></input></td>
                                                <td><input onChange={this.changeBusEnd.bind(this)} placeholder="End Time"></input></td>
                                                <td><input onChange={this.changeBusOrigin.bind(this)} placeholder="Origin"></input></td>
                                                <td><input onChange={this.changeBusDestination.bind(this)} placeholder="Destination"></input></td>
                                                <td><input onChange={this.changeBusDimensions.bind(this)} placeholder="x,y"></input></td>
                                                <td><button onClick={this.submitBus.bind(this)}>Submit</button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="portfolio" className="p-0"></section>
                <section className="bg-light text-black" style={{ backgroundImage: "url(&quot;assets/img/header%20background.jpg&quot;)" }}>
                    <div className="container text-center">
                        <h2 className="mb-4">Trains</h2>
                        <div className="table-responsive">
                            <table className="table" style={{ color: 'black' }} id="schedule">
                                <thead>
                                    <tr>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Origin</th>
                                        <th>Destination</th>
                                        <th>Dimensions</th>
                                        <th>Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.trainList.map(
                                        function (data, index) {
                                            return (<tr>
                                                <td>{data.starttimes}</td>
                                                <td>{data.endtimes}</td>
                                                <td>{data.startlocation}</td>
                                                <td>{data.destination}</td>
                                                <td>{data.dimensions}</td>
                                                <td>{data.risk}</td>
                                            </tr>)
                                        })
                                    }
                                    <tr>
                                                <td><input onChange={this.changeTrainStart.bind(this)} placeholder="Start Time"></input></td>
                                                <td><input onChange={this.changeTrainEnd.bind(this)} placeholder="End Time"></input></td>
                                                <td><input onChange={this.changeTrainOrigin.bind(this)} placeholder="Origin"></input></td>
                                                <td><input onChange={this.changeTrainDestination.bind(this)} placeholder="Destination"></input></td>
                                                <td><input onChange={this.changeTrainDimensions.bind(this)} placeholder="x,y"></input></td>
                                                <td><button onClick={this.submitTrain.bind(this)}>Submit</button></td>
                                            </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
                <section id="about" style={{
                    backgroundColor:
                        "#0079C6", opacity: "1", backgroundImage: "url(&quot;assets/img/white.jpg&quot;)"
                }}>
                    <div className="container">
                        <div className="row">
                            <div className="col offset-lg-8 mx-auto text-center">
                                <div style={{ backgroundImage: "url(&quot;assets/img/red%20lines.jpg&quot;)", height: "80px" }}>
                                    <h2 className="text-white section-heading"
                                        style={{ backgroundColor: "rgba(222,41,41,0)", height: "38px" }}>Planes</h2>
                                    <hr className="light my-4"></hr>
                                </div>
                                <div className="table-responsive">
                                    <table className="table" style={{ color: 'white' }} id="queue">
                                        <thead>
                                            <tr>
                                                <th>Start Time</th>
                                                <th>End Time</th>
                                                <th>Origin</th>
                                                <th>Destination</th>
                                                <th>Dimensions</th>
                                                <th>Risk</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.planeList.map(
                                                function (data, index) {
                                                    return (<tr>
                                                        <td>{data.starttimes}</td>
                                                        <td>{data.endtimes}</td>
                                                        <td>{data.startlocation}</td>
                                                        <td>{data.destination}</td>
                                                        <td>{data.dimensions}</td>
                                                        <td>{data.risk}</td>
                                                    </tr>)
                                                })
                                            }
                                             <tr>
                                                <td><input onChange={this.changePlaneStart.bind(this)} placeholder="Start Time"></input></td>
                                                <td><input onChange={this.changePlaneEnd.bind(this)} placeholder="End Time"></input></td>
                                                <td><input onChange={this.changePlaneOrigin.bind(this)} placeholder="Origin"></input></td>
                                                <td><input onChange={this.changePlaneDestination.bind(this)} placeholder="Destination"></input></td>
                                                <td><input onChange={this.changePlaneDimensions.bind(this)} placeholder="x,y"></input></td>
                                                <td><button onClick={this.submitPlane.bind(this)}>Submit</button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="footer-basic">
                    <footer>
                        {/* <ul className="list-inline">
                            <li className="list-inline-item"><a href="./terms">Terms</a></li>
                            <li className="list-inline-item"><a href="./privacy">Privacy
                                    Policy</a></li>
                        </ul> */}
                        <p className="copyright"><br />Sai Vedagiri, Arya Tschand, Gustav Hansen,
                            and Elias Wambugu © 2020<br /></p>
                    </footer>
                </div>
            </div>
        );
    }

}


export default Admin