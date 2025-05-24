export interface Paging {
  page: number;
  per_page: number;
}

export interface Sort {
  property: string;
  direction: "asc" | "desc";
}

export interface Filter {
  property: string;
  value: any;
}

export const buildQueryParams = (params: {
  paging_options: Paging;
  sorts?: Sort[];
  filters?: Filter[];
}): string => {
  const queryParams = new URLSearchParams();

  queryParams.append(
    "paging_options[page]",
    params.paging_options.page.toString()
  );
  queryParams.append(
    "paging_options[per_page]",
    params.paging_options.per_page.toString()
  );

  params.filters?.forEach((filter, index) => {
    queryParams.append(`filters[${index}][property]`, filter.property);
    queryParams.append(`filters[${index}][value]`, filter.value.toString());
  });

  params.sorts?.forEach((sort, index) => {
    queryParams.append(`sorts[${index}][property]`, sort.property);
    queryParams.append(`sorts[${index}][direction]`, sort.direction);
  });

  return queryParams.toString();
};
