function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
}

export function compareSortValues(leftValue, rightValue, locale = 'pl') {
  if (isEmptyValue(leftValue) && isEmptyValue(rightValue)) {
    return 0;
  }

  if (isEmptyValue(leftValue)) {
    return 1;
  }

  if (isEmptyValue(rightValue)) {
    return -1;
  }

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue;
  }

  return String(leftValue).localeCompare(String(rightValue), locale, {
    numeric: true,
    sensitivity: 'base',
  });
}

export function sortCollection(items, sortConfig, resolveValue, locale = 'pl') {
  if (!sortConfig?.key) {
    return items;
  }

  const sortedItems = [...items];
  sortedItems.sort((leftItem, rightItem) => {
    const comparison = compareSortValues(
      resolveValue(leftItem, sortConfig.key),
      resolveValue(rightItem, sortConfig.key),
      locale
    );

    return sortConfig.direction === 'desc' ? -comparison : comparison;
  });

  return sortedItems;
}

export function toggleSortConfig(currentSort, key, defaultDirection = 'asc') {
  if (currentSort?.key === key) {
    return {
      key,
      direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
    };
  }

  return {
    key,
    direction: defaultDirection,
  };
}
