// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = '개발자로 살아남기';
export const SITE_SUBTITLE = 'iOS 개발자에서 Product Engineer로, 그리고 AI 시대의 생존 기록';
export const SITE_DESCRIPTION = 'iOS 개발자에서 Product Engineer(PE)로의 전환기, 실전 AI 에이전트 활용법, 변화하는 개발자 시장 트렌드와 생존 팁을 기록합니다.';
export const AUTHOR_NAME = 'Kyungseok Lee';

export interface CategoryInfo {
	slug: string;
	name: string;
	description: string;
	icon: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
	career: {
		slug: 'career',
		name: '커리어 전환 (iOS → PE)',
		description: 'iOS 네이티브 개발자에서 프로덕트 엔지니어(PE)로의 도전과 회고',
		icon: '🚀',
	},
	ai: {
		slug: 'ai',
		name: 'AI 에이전트 & 워크플로우',
		description: '실무 엔지니어링을 혁신하는 AI 도구, 에이전트 활용법과 바이브 코딩',
		icon: '🤖',
	},
	market: {
		slug: 'market',
		name: '시장 분석 & 트렌드',
		description: 'AI 시대에 재편되는 테크 시장과 개발자 생존 전략 분석',
		icon: '📈',
	},
	tips: {
		slug: 'tips',
		name: '실전 엔지니어링 팁',
		description: '빠른 프로토타이핑, 가설 검증, 프로덕트 개발 생산성을 높이는 실전 팁',
		icon: '💡',
	},
};

