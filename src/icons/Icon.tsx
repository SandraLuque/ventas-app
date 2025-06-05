import {
  ReportsIcon,
  ProductsIcon,
  OutdentIcon,
  BagtIcon,
  Logo,
  InventoryIcon,
  SalesIcon,
  UserFemaleIcon,
  UserMaleIcon,
  SearchProductIcon,
  SearchNotFoundIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  FilePdfIcon,
  FileExcelIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  EllipsisIcon,
  GearsIcon,
  DashboardIcon,
} from './Icons'

const iconMap = {
  logo: Logo,
  outdent: OutdentIcon,
  bag: BagtIcon,
  reports: ReportsIcon,
  products: ProductsIcon,
  inventory: InventoryIcon,
  sales: SalesIcon, 
  userFemale: UserFemaleIcon, 
  userMale: UserMaleIcon,
  search: SearchIcon,
  searchProduct: SearchProductIcon,
  searchNotFound: SearchNotFoundIcon,
  chevronLeft: ChevronLeftIcon,
  chevronDown: ChevronDownIcon,
  filePdf: FilePdfIcon,
  fileExcel: FileExcelIcon,
  trash: TrashIcon,
  pencil: PencilIcon,
  plus: PlusIcon,
  save: SaveIcon,
  ellipsis: EllipsisIcon,
  gears: GearsIcon,
  dashboard: DashboardIcon,
}

export type IconName = keyof typeof iconMap

type IconProps = {
  name: IconName
  size?: number
  sizew?: number
  sizeh?: number
  color?: string
  className?: string
}

export const Icon = ({
  name,
  size = 24,
  sizew = 24,
  sizeh = 24,
  color = 'currentColor',
  className,
}: IconProps) => {
  const IconComponent = iconMap[name]
  return <IconComponent width={sizew} height={sizeh} fill={color} className={className} />
}