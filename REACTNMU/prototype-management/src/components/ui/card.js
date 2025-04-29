import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export function Card({ className, children }) {
  return (
    <div
      className={classNames(
        'rounded-2xl shadow-md bg-white dark:bg-gray-800 p-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, className }) {
  return (
    <div className={classNames('mb-4', className)}>
      {title && <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>}
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-300">{subtitle}</p>}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={classNames('text-lg font-bold text-gray-800 dark:text-white', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={classNames('text-sm text-gray-700 dark:text-gray-300', className)}>
      {children}
    </div>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
