import { ReactNode } from 'react';
import '../styles/global.css';
import { Lato } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const lato = Lato({
	weight: ['400', '700'],
	display: 'swap',
	style: 'normal',
	subsets: ['latin']
});

export default function RootLayout({
	// Layouts must accept a children prop.
	// This will be populated with nested layouts or pages
	children
}: {
	children: ReactNode;
}) {
	return (
		<html lang="en" className={lato.className}>
			<body className="flex flex-col items-center">
				<div className="w-full max-w-screen-2xl pl-6 pr-6 md:pl-14 md:pr-14">
					<nav className="flex h-20 items-center justify-between md:h-28 lg:h-36">
						<Link href={'/'}>
							<Image
								src={'/logo.svg'}
								width={85}
								height={15}
								alt={'logo'}
								className="md:h-5 md:w-28"
							/>
						</Link>

						<div className="flex gap-10">
							<Link href={'/episodes'} className="text-xs uppercase text-black">
								episodes
							</Link>
							<Link href={'/discover'} className="text-xs uppercase text-black">
								discover
							</Link>
							<Link href={'/auth'} className="text-xs uppercase text-black">
								connect
							</Link>
						</div>
					</nav>
					{children}

					<footer className="h-20  md:h-28 lg:h-36" />
				</div>
			</body>
		</html>
	);
}
