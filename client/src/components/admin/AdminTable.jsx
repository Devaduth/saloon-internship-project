const AdminTable = ({ columns = [], rows = [], emptyMessage = 'No records yet.', rowKey = '_id', renderRowActions, renderCell }) => {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {renderRowActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {!rows.length ? (
            <tr>
              <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="admin-table__empty">{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row[rowKey] || `${rowKey}-${index}`}>
                {columns.map((column) => (
                  <td key={column.key}>{renderCell ? renderCell(row, column) : row[column.key] || '—'}</td>
                ))}
                {renderRowActions ? <td>{renderRowActions(row)}</td> : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;