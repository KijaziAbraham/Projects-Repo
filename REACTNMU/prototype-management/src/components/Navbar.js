import React from "react";
import { useNavigate } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const DashboardNavbar = ({ user, searchTerm, setSearchTerm, handleShowSubmitModal, userRole }) => {
  const navigate = useNavigate();
  
  return (
    <Navbar expand="lg" className="bg-body-light mb-2" style={{borderBottom:"2px solid gray"}}>
      <Container fluid>
      <Navbar.Brand className="text text-bg" style={{fontSize:'1.5rem',color:'#64A293'}}>
        Logged in as :  {user ? `${user.full_name}` : ""}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            {/* You can add navigation items here if needed */}
          </Nav>
          <div className="controls-row">
              <div class="search-control">
                <input
              type="search"
              placeholder="Search prototypes..."
              className="me-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <Button style={{backgroundColor:'#64A293',border:'none',}}>Search</Button>
         
</div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DashboardNavbar;