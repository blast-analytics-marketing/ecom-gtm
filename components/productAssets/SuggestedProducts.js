import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductRow from '../products/ProductRow';
import { connect } from 'react-redux';
import {
  productImpressions,
  productClick
} from '../../store/actions/analyticsActions';

class SuggestedProducts extends Component {
  constructor(props) {
    super(props)
    this.sendProductClick = this.sendProductClick.bind(this)
  }
  componentDidUpdate(prevProps){
    if(prevProps.products !== this.props.products){
      this.props.dispatch(productImpressions(this.props.products.slice(0,4), 'Suggested Products'))
    }
  }
  sendProductClick(id, position) {
    const products = this.props.products.filter((prod, i) => prod.id === id);
    this.props.dispatch(productClick(products, position, id, 'Suggested Products'))
  }
  render() {
    const { products } = this.props;

    return (
      <div className="custom-container py-5 my-5">
        <div className="d-flex flex-column align-items-center mb-5 pb-4">
          <p className="font-color-medium mb-4">
            Suggested products
          </p>
          <p
            className="text-center font-size-display1 mb-3 font-weight-medium"
            style={{ maxWidth: '32rem' }}
          >
            You may also like to check out these products.
          </p>
        </div>
        <ProductRow products={products.slice(0, 4)} productClick={this.sendProductClick}/>
      </div>
    );
  }
}

SuggestedProducts.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};

SuggestedProducts.defaultProps = {
  products: [],
};

export default connect(state => state)(SuggestedProducts);
