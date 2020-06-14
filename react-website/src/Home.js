import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css';
import './assets/css/styles.min.css'
import Background from './assets/img/header.jpg';


class Home extends React.Component {
    constructor(props) {
        super(props);
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
                <header className="masthead text-center text-white d-flex" style={{ backgroundImage: `url(${Background})`}}>
                    <div className="container my-auto">
                        <div className="row">
                            <div className="col-lg-10 mx-auto">
                                <h1 className="text-uppercase"><strong>Welcome to SafeTravels</strong></h1>
                                <hr></hr>
                            </div>
                        </div>
                        <div className="col-lg-8 mx-auto">
                            <p className="text-faded mb-5">Restore confidence in safe
                            public transportation.</p><a className="btn
                                btn-primary btn-xl js-scroll-trigger" role="button"
                                href="./admin">Admin Console</a></div>
                    </div>
                </header>
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


export default Home