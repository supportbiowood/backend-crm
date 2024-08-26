
const filterQuery = (sql, filterModel ) => {
    if(filterModel && filterModel.items && filterModel.items.length){
        const filterModelLength = filterModel.items.length;
        if (filterModelLength > 0) sql += " AND ";
        for (let index = 0; index < filterModelLength; index++) {
            const element = filterModel.items[index];
            if (element.operatorValue === "equals") {
                sql += element.columnField + " = '" + element.value + "'";
            } else if (element.operatorValue === "contains") {
                sql += element.columnField + " LIKE '%" + element.value + "%'";
            } else if (element.operatorValue === "startsWith") {
                sql += element.columnField + " LIKE '" + element.value + "%'";
            } else if (element.operatorValue === "endsWith") {
                sql += element.columnField + " LIKE '%" + element.value + "'";
            } else if (element.operatorValue === "isEmpty") {
                sql += element.columnField + " = NULL'";
            } else if (element.operatorValue === "isNotEmpty") {
                sql += element.columnField + " != NULL";
            } else if (element.operatorValue === "isAnyOf") {
                sql += element.value.map(value => `${element.columnField} like '%${value}%'`).join(" OR ");
            } else if (element.operatorValue === "is") {
                sql += element.columnField + " = '" + element.value + "'";
            }
            if (index < filterModelLength - 1)
                sql += " " + filterModel.linkOperator + " ";
        }
    }

    return sql;
};

const sortQuery = (sql, sortModel) => {
    if(sortModel && sortModel.length)
    {
        const sortModelLength = sortModel.length;
        if (sortModelLength > 0) sql += " ORDER BY ";
        for (let index = 0; index < sortModelLength; index++) {
            const element = sortModel[index];
            sql += element.field + " " + element.sort;
            if (index < sortModelLength - 1) sql += ", ";
        }}
    return sql;
};

const pageQuery = (sql, pageModel) => {
    pageModel.page = Math.abs(parseInt(pageModel.page || 0));
    pageModel.pageSize = Math.abs(parseInt(pageModel.pageSize || 10));
    if (pageModel.page >= 0 && pageModel.pageSize >= 0) {
        sql +=
            ` LIMIT ${pageModel.pageSize} OFFSET ${pageModel.pageSize * pageModel.page}`;
    }
    
    return sql;
};

const formatQuery = (sql = " where 1 ", filterModel, sortModel = [], pageModel = {}, keys, search ) => {
    let statement = sql + filterQuery("", filterModel);
    statement = statement + ' AND ' + formatFulltextSearch(keys, search);
    statement = sortQuery(statement, sortModel);
    statement = pageQuery(statement, pageModel);
    return statement;
};

const formatFulltextSearch = (keys, search) => {
    let statement = "";
    if(keys && keys.length)
    {
        if(search && search.length >= 1) {
            statement = keys.join(` LIKE '%${search}%' OR `) + ` LIKE '%${search}%' `;
            statement = ` ( ${statement} ) `;
        }
    }
    return statement && statement.length > 0 ? statement : "1";
};


module.exports = {
    formatQuery,
    filterQuery,
    sortQuery,
    pageQuery,
    formatFulltextSearch
};