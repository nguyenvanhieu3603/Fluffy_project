import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaExclamationCircle, FaCheck, FaEye, FaStore } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports');
      setReports(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
      const note = prompt("Nhập ghi chú xử lý (VD: Đã hoàn tiền, Đã khóa shop...):");
      if (note) {
          try {
              await api.put(`/admin/reports/${id}/resolve`, { adminNote: note });
              toast.success('Đã giải quyết khiếu nại');
              fetchReports();
          } catch (error) {
              toast.error('Lỗi khi xử lý');
          }
      }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Khiếu nại & Báo cáo</h2>
      
      {loading ? <div>Đang tải...</div> : reports.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm">
              Tuyệt vời! Không có khiếu nại nào cần xử lý.
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                    <tr>
                        <th className="p-4">Mã Đơn</th>
                        <th className="p-4">Người tố cáo</th>
                        <th className="p-4">Shop bị cáo</th>
                        <th className="p-4 w-1/3">Lý do</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {reports.map(report => (
                        <tr key={report._id} className="hover:bg-gray-50">
                            <td className="p-4 font-mono text-blue-600">
                                <Link to={`/order/${report.order?._id}`} target="_blank">
                                    #{report.order?._id.slice(-6).toUpperCase()}
                                </Link>
                            </td>
                            <td className="p-4 font-bold text-gray-700">{report.customer?.fullName}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-1 text-red-600 font-medium">
                                    <FaStore /> {report.seller?.sellerInfo?.shopName}
                                </div>
                            </td>
                            <td className="p-4">
                                <p className="text-gray-800">{report.reason}</p>
                                {report.adminNote && (
                                    <p className="text-xs text-green-600 mt-1 italic">Note: {report.adminNote}</p>
                                )}
                            </td>
                            <td className="p-4">
                                {report.status === 'pending' ? (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit">
                                        <FaExclamationCircle /> Chờ xử lý
                                    </span>
                                ) : (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit">
                                        <FaCheck /> Đã xong
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                {report.status === 'pending' && (
                                    <button 
                                        onClick={() => handleResolve(report._id)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-bold shadow-sm"
                                    >
                                        Xử lý ngay
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      )}
    </div>
  );
};

export default AdminReports;