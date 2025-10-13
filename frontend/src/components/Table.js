import styled from "styled-components";

export const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	background: var(--surface);
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	@media (max-width: 768px) {
		display: block;
		width: 100%;
		box-shadow: none;
		background: none;
		border-radius: 0;
		overflow: visible;
	}
`;

export const Th = styled.th`
	background: var(--primary);
	color: white;
	padding: 16px;
	text-align: left;
	font-weight: 600;
	font-size: 14px;
	@media (max-width: 768px) {
		display: none;
	}
`;

export const Td = styled.td`
	padding: 16px;
	border-bottom: 1px solid var(--border);
	font-size: 14px;
	@media (max-width: 768px) {
		display: block;
		padding: 12px 8px;
		border-bottom: none;
		font-size: 15px;
	}
`;

export const Tr = styled.tr`
	&:hover { background: rgba(32, 172, 159, 0.05); }
	&:last-child td { border-bottom: none; }
	@media (max-width: 768px) {
		display: block;
		margin-bottom: 18px;
		background: var(--surface);
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.07);
		padding: 10px;
	}
`;
