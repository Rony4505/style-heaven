import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { formatBdt, type Order } from '../types'

export function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { lang } = useStore()

  const savePdf = () => {
    const node = document.getElementById('invoice-sheet')
    if (!node) return
    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) return
    win.document.write(`<!doctype html><html><head><title>${order.id}</title>
      <style>
        body{font-family:Georgia,serif;color:#1a1612;padding:32px}
        h1{letter-spacing:.2em;text-transform:uppercase;font-size:22px;margin:0}
        table{width:100%;border-collapse:collapse;margin-top:18px}
        th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
        .gold{color:#9a7b3c}
        .row{display:flex;justify-content:space-between;gap:24px}
      </style></head><body>${node.innerHTML}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="overlay invoice-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div id="invoice-sheet" className="invoice-sheet">
          <div className="row">
            <div>
              <h1>Style Heaven</h1>
              <p className="gold">Bangladesh</p>
            </div>
            <div>
              <strong>{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</strong>
              <p>{order.id}</p>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="row">
            <div>
              <p>
                <strong>{order.guest ? 'Unknown' : order.customerName}</strong>
              </p>
              <p>{order.email}</p>
              <p>
                +{order.phoneDial} {order.phone}
              </p>
              <p>
                {order.address}, {order.city}
                {order.postal ? `, ${order.postal}` : ''}
              </p>
            </div>
            <div>
              <p>
                <strong>{lang === 'bn' ? 'ট্র্যাকিং নম্বর' : 'Tracking number'}</strong>
              </p>
              <p className="gold">{order.trackingNumber}</p>
              <p>
                {order.payment}
                {order.paymentAccount ? ` · ${order.paymentAccount}` : ''}
              </p>
              <p>{order.status}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Colour</th>
                <th>Qty</th>
                <th>BDT</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={`${item.productId}-${i}`}>
                  <td>{item.name}</td>
                  <td>{item.size}</td>
                  <td>{item.color}</td>
                  <td>{item.qty}</td>
                  <td>{formatBdt(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="row">
            <span>Shipping</span>
            <strong>BDT {formatBdt(order.shipping)}</strong>
          </p>
          {order.discount > 0 && (
            <p className="row">
              <span>Discount</span>
              <strong>− BDT {formatBdt(order.discount)}</strong>
            </p>
          )}
          <p className="row grand">
            <span>Total</span>
            <strong>BDT {formatBdt(order.total)}</strong>
          </p>
        </div>
        <div className="invoice-actions">
          <button className="ghost" onClick={onClose} type="button">
            Close
          </button>
          <Link className="ghost" to={`/track/${order.trackingNumber}`} onClick={onClose}>
            {lang === 'bn' ? 'ডেলিভারি ট্র্যাক' : 'Track delivery'}
          </Link>
          <button className="gold-btn compact" onClick={savePdf} type="button">
            {lang === 'bn' ? 'পিডিএফ সেভ' : 'Save PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
