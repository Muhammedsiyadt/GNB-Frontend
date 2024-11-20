import { Button } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="error" id="error">
  <div className="container d-flex justify-content-center align-items-center" style={{ marginTop:"100px"}}>
    <div className="content centered">
      <h1 className=' display-5 fw-bold'>Oops, looks like the page is lost.</h1>
      <p style={{ fontSize: 22 }} className="sub-header text-black text-block-narrow">
        This is not a fault, just an accident that was not intentional.
      </p>
     <div className="mt-4 mb-4">
     <Link to={'/locations'}>
        <Button type="primary" size="large">Go Back</Button>
      </Link>
     </div>
    </div>
  </div>
</div>

  )
}

export default NotFound