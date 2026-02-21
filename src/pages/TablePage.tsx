import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useEffect, useState } from 'react'
import axios from 'axios'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

interface ArtWork {
  id: number
  title: string
  place_of_origin: string
  artist_display: string
  inscriptions: string
  date_start: number
  date_end: number
}

const TablePage = () => {

  const [artWorks, setArtWorks] = useState<ArtWork[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalArtWorks, setTotalArtWorks] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const rows = 12
  const [showSelectBox, setShowSelectBox] = useState(false);
  const [selectInput, setSelectInput] = useState("");

  const selectedRows = artWorks.filter((art) =>
    selectedWorks.has(art.id)
  )

  const totalPages = Math.ceil(totalArtWorks / rows);
  const first = (rows * currentPage - (rows) + 1)
  const last = Math.min(rows * currentPage, totalArtWorks)

  const firstPageNumber = Math.max(1, currentPage - 2);
  const lastPageNumber = Math.min(totalPages, currentPage + 2)
  const pages = [];
  for (let i = firstPageNumber; i <= lastPageNumber; i++) {
    pages.push(i)
  }

  const [pageInput, setPageInput] = useState<string>(currentPage.toString())

  const handleSelectionChange = (e: { value: ArtWork[] }) => {
    const newSelectedRows: ArtWork[] = e.value;

    const updatedIds = new Set<number>(selectedWorks);

    artWorks.forEach((art) => {
      updatedIds.delete(art.id);
    });

    newSelectedRows.forEach((art) => {
      updatedIds.add(art.id);
    });

    setSelectedWorks(updatedIds);
  }

  const applyCustomSelection = () => {
    const count = Number(selectInput);

    if (!count || count <= 0) {
      setShowSelectBox(false);
      setSelectInput("");
      return;
    }

    const limit = Math.min(count, artWorks.length);

    const updated = new Set(selectedWorks);

    for (let i = 0; i < limit; i++) {
      updated.add(artWorks[i].id);
    }

    setSelectedWorks(updated);
    setShowSelectBox(false);
    setSelectInput("");
  };

  const fetchArtWorks = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`)
      setArtWorks(response.data.data)
      setTotalArtWorks(response.data.pagination.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    setPageInput(currentPage.toString())
    fetchArtWorks()
  }, [currentPage])

  return (
    <div className='mx-auto'>
      <DataTable lazy loading={loading} value={artWorks} selection={selectedRows} onSelectionChange={e => handleSelectionChange(e)} dataKey='id' tableStyle={{ minWidth: '50rem' }} selectionMode={'multiple'}>
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions" headerStyle={{ overflow: 'clip' }}></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>

      <div className='flex max-md:flex-col justify-between items-center my-5 w-[90%] mx-auto'>
        <div>
          <p>Showing <b>{first}</b> to <b>{last}</b> of <b>{totalArtWorks}</b> Artworks</p>
        </div>
        {selectedWorks.size > 0 &&
          <p className='text-center'><b>{selectedWorks.size}</b> Selected</p>
        }
        <div className='flex items-center justify-center gap-1'>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} className='border rounded-sm text-sm p-2 cursor-pointer hover:bg-[#f0eeeeac]'>Previous</button>
          <div className='flex justify-center items-center gap-1'>
            {pages.map(page =>
              <button key={page} onClick={() => setCurrentPage(page)} className={`border rounded-sm w-10 p-1.5 cursor-pointer ${currentPage === page ? 'bg-blue-300' : 'bg-white hover:bg-[#f0eeee]'}`}>
                {page}
              </button>
            )}
          </div>
          <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className='border rounded-sm text-sm p-2 cursor-pointer hover:bg-[#f0eeeeac]'>Next</button>
          <input className='w-12 p-1.5 text-sm border' type="number" value={currentPage} max={totalPages}
            onChange={(e) => {
              setPageInput(e.target.value)
            }}
            onBlur={() => {
              const value = Number(pageInput)
              if (!isNaN(value)) {
                const safePage = Math.min(Math.max(value, 1), totalPages);
                setCurrentPage(safePage);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = Number(pageInput)
                if (!isNaN(value)) {
                  const safePage = Math.min(Math.max(value, 1), totalPages);
                  setCurrentPage(safePage);
                }
              }
            }}
          />
        </div>
      </div>
      <div className='w-[90%] mx-auto flex gap-5 justify-start items-center'>
        <button
          onClick={() => setShowSelectBox(!showSelectBox)}
          className="border px-3 py-1 text-sm rounded-sm cursor-pointer"
        >
          Select N Rows
        </button>
        {showSelectBox && (
          <div className="mt-2 border p-3 w-fit bg-gray-50">
            <p className="text-sm mb-2">Enter number of rows to select:</p>

            <input
              type="number"
              value={selectInput}
              min={1}
              max={artWorks.length}
              onChange={(e) => setSelectInput(e.target.value)}
              className="border p-1 w-16 mr-2 text-sm"
            />

            <button
              onClick={applyCustomSelection}
              className="border px-2 py-1 text-sm mr-2"
            >
              Apply
            </button>

            <button
              onClick={() => setShowSelectBox(false)}
              className="border px-2 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TablePage